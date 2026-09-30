import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.LOCAL_OPERATIONS_ENABLED = 'true'
process.env.APP_BASE_URL = 'http://127.0.0.1:3002'
process.env.LOCAL_OWNER_PASSWORD = 'synthetic-test-password-only'
process.env.GOOGLE_CLIENT_ID = 'synthetic-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'synthetic-client-secret'
process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = '11'.repeat(32)
process.env.LOCAL_OPERATIONS_DB_PATH = join(mkdtempSync(join(tmpdir(), 'lk-operations-test-')), 'operations.sqlite')

const { getDb, acquireSyncLease, releaseSyncLease } = await import('./infrastructure/local-db.ts')
const { createEnquiry, getEnquiry, listChanges, saveImportedGmailEnquiry, scheduleEnquiry } = await import('./infrastructure/store.ts')
const { validateEnquiry, validateSchedule, AppError } = await import('./domain/validation.ts')
const { startGoogleOAuth, finishGoogleOAuth } = await import('./infrastructure/auth.ts')
const { pushPending, pullChanges, decideChange, selectCalendar } = await import('./infrastructure/google-calendar.ts')
const { loginPost, operationsGet, syncAll } = await import('./server-api.ts')

const db = getDb()
const input = (key:string, date:string|null = null) => ({
  serviceId:'cabinet-painting', projectIntent:'Repaint existing doors', targetSurfaces:['doors'], suburb:'Sydney', postcode:'2000',
  doorCount:4, drawerCount:2, notes:'First line\nSecond line', name:'Test Person', email:'test@example.test', preferredDate:date,
  acknowledgement:true, idempotencyKey:key,
})

test('web enquiry is durable and idempotency rejects different payloads', () => {
  const first = createEnquiry(validateEnquiry(input('idem-1')))
  const again = createEnquiry(validateEnquiry(input('idem-1')))
  assert.equal(first.id, again.id)
  assert.equal(getEnquiry(first.id)?.notes, 'First line\nSecond line')
  assert.throws(() => createEnquiry(validateEnquiry({ ...input('idem-1'), doorCount:5 })), (error:unknown) => error instanceof AppError && error.status === 409)
})

test('Sydney DST gaps, repeated times, and backwards schedules are rejected', () => {
  assert.throws(() => validateSchedule('2026-10-04T02:30','2026-10-04T04:00'))
  assert.throws(() => validateSchedule('2027-04-04T02:30','2027-04-04T04:00'))
  assert.throws(() => validateSchedule('2099-01-03T17:00','2099-01-03T09:00'))
  const valid = validateSchedule('2099-01-03T09:00','2099-01-03T17:00')
  assert.ok(Date.parse(valid.endAt) > Date.parse(valid.startAt))
})

test('Gmail messages in a thread share one enquiry and retain latest bounded history', () => {
  let lastId = ''
  for (let i=35;i>=1;i--) {
    const candidate = { messageId:`m${i}`,threadId:'thread-1',internalDate:new Date(Date.UTC(2099,0,i)).toISOString(),senderName:'Unverified',senderEmail:'sender@example.test',senderReviewRequired:true as const,subject:'Cabinet question',bodyText:`Message ${i}`,bodyStatus:'available' as const,attachments:[],attachmentCount:0 }
    const saved = saveImportedGmailEnquiry('sub-1', candidate)
    if (lastId) assert.equal(saved.id,lastId)
    lastId=saved.id
  }
  const enquiry = getEnquiry(lastId)!
  assert.equal(enquiry.source,'gmail')
  assert.equal(enquiry.acknowledgement,false)
  assert.equal(enquiry.gmail?.messages.length,30)
  assert.equal(enquiry.gmail?.messages[0].messageId,'m6')
  assert.equal(enquiry.gmail?.messages.at(-1)?.messageId,'m35')
  assert.equal(enquiry.gmail?.historyTruncated,true)
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM enquiries WHERE id=?').get(lastId)?.count,1)
  db.prepare("INSERT INTO change_requests(id,enquiry_id,kind,proposed_start_at,proposed_end_at,proposed_preferred_date,provider_etag,enquiry_revision,status,revision,created_at) VALUES('review-gmail',?,'move',NULL,NULL,'2099-02-01','etag-gmail',?,'pending',1,?)").run(lastId,enquiry.revision,new Date().toISOString())
  saveImportedGmailEnquiry('sub-1',{ messageId:'m36',threadId:'thread-1',internalDate:new Date(Date.UTC(2099,1,1)).toISOString(),senderName:'Different unverified sender',senderEmail:'other@example.test',senderReviewRequired:true,subject:'Reply',bodyText:'More detail',bodyStatus:'available',attachments:[],attachmentCount:0 })
  const review=db.prepare("SELECT enquiry_revision,revision FROM change_requests WHERE id='review-gmail'").get() as {enquiry_revision:number;revision:number}
  assert.equal(review.enquiry_revision,getEnquiry(lastId)?.revision)
  assert.equal(review.revision,2)
})

test('auth denies unknown owner and foreign-origin mutations', async () => {
  const noSession = await operationsGet(new Request('http://127.0.0.1:3002/api/operations'))
  assert.equal(noSession.status,401)
  const foreign = await loginPost(new Request('http://127.0.0.1:3002/api/operations/login',{method:'POST',headers:{origin:'https://attacker.test','content-type':'application/json'},body:JSON.stringify({password:'synthetic-test-password-only'})}))
  assert.equal(foreign.status,403)
  const wrong = await loginPost(new Request('http://127.0.0.1:3002/api/operations/login',{method:'POST',headers:{origin:'http://127.0.0.1:3002','content-type':'application/json'},body:JSON.stringify({password:'wrong'})}))
  assert.equal(wrong.status,401)
  const okay = await loginPost(new Request('http://127.0.0.1:3002/api/operations/login',{method:'POST',headers:{origin:'http://127.0.0.1:3002','content-type':'application/json'},body:JSON.stringify({password:'synthetic-test-password-only'})}))
  assert.equal(okay.status,200)
  const cookie = okay.headers.get('set-cookie')!.split(';')[0]
  const permitted = await operationsGet(new Request('http://127.0.0.1:3002/api/operations',{headers:{cookie}}))
  assert.equal(permitted.status,200)
})

test('OAuth state is one-time, browser-bound, and rejects another Google account', async () => {
  const originalFetch = globalThis.fetch
  let fetches=0
  globalThis.fetch = async (resource) => {
    fetches++
    const url = String(resource)
    if (url.includes('/token')) return Response.json({access_token:'synthetic-token',refresh_token:'synthetic-refresh',scope:'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.events.owned https://www.googleapis.com/auth/gmail.readonly',expires_in:3600})
    return Response.json({sub:'wrong-sub',email:'someoneelse@gmail.com',email_verified:true})
  }
  try {
    const first = startGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/connect'))
    const state = new URL(first.url).searchParams.get('state')!
    await assert.rejects(finishGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/callback',{headers:{cookie:'lk_google_oauth=wrong'}}),state,'code'))
    assert.equal(fetches,0)
    const second = startGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/connect'))
    const state2 = new URL(second.url).searchParams.get('state')!
    const cookie = second.cookie.split(';')[0]
    await assert.rejects(finishGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/callback',{headers:{cookie}}),state2,'code'),(error:unknown)=>error instanceof AppError && error.status===403)
    await assert.rejects(finishGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/callback',{headers:{cookie}}),state2,'code'),(error:unknown)=>error instanceof AppError && error.status===400)
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM google_connection').get()?.count,0)
  } finally { globalThis.fetch=originalFetch }
})

test('Calendar retry does not overwrite a moved event after lost insert response', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (resource) => {
    const url=String(resource)
    if (url.includes('/token')) return Response.json({access_token:'synthetic-token',refresh_token:'synthetic-refresh',scope:'openid email https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.events.owned https://www.googleapis.com/auth/gmail.readonly',expires_in:3600})
    if (url.includes('/userinfo')) return Response.json({sub:'approved-sub',email:'Lnkgroupsydney@gmail.com',email_verified:true})
    throw new Error('Unexpected OAuth request')
  }
  const auth = startGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/connect'))
  await finishGoogleOAuth(new Request('http://127.0.0.1:3002/api/google/callback',{headers:{cookie:auth.cookie.split(';')[0]}}),new URL(auth.url).searchParams.get('state')!,'code')
  db.prepare("UPDATE google_connection SET selected_calendar_id='owned-calendar' WHERE id=1").run()
  const enquiry=createEnquiry(validateEnquiry(input('calendar-lost-insert','2099-01-01')))
  let eventBody: {id:string;extendedProperties:{private:{enquiryId:string;revision:string}};start:{date:string}}|null=null
  let patches=0
  globalThis.fetch = async (resource, init) => {
    const url=String(resource)
    if (init?.method==='POST') { eventBody=JSON.parse(String(init.body)) as typeof eventBody; return new Response('',{status:409}) }
    if (init?.method==='PATCH') { patches++; return Response.json({}) }
    if (url.includes('/events/')) return Response.json({ ...eventBody, start:{date:'2099-01-02'},end:{date:'2099-01-03'},etag:'"moved"' })
    throw new Error('Unexpected Google request')
  }
  try {
    const first=await pushPending(db)
    assert.equal(first.conflicts,1)
    assert.equal(getEnquiry(enquiry.id)?.calendarStatus,'conflict')
    const second=await pushPending(db)
    assert.equal(second.synced,0)
    assert.equal(patches,0)
    assert.equal(listChanges().filter((c)=>c.enquiryId===enquiry.id).length,1)
  } finally { globalThis.fetch=originalFetch }
})

test('Calendar recurrence after lost insert becomes review, never silent adoption', async () => {
  const enquiry=createEnquiry(validateEnquiry(input('calendar-recurrence','2099-01-10')))
  const originalFetch=globalThis.fetch
  let body:{id:string;extendedProperties:{private:{enquiryId:string;revision:string}};start:{date:string};end:{date:string}}|null=null
  let patches=0
  globalThis.fetch=async (resource,init) => {
    const url=String(resource)
    if (init?.method==='POST') { body=JSON.parse(String(init.body)) as typeof body; return new Response('',{status:409}) }
    if (init?.method==='PATCH') { patches++; return Response.json({}) }
    if (url.includes('/events/')) return Response.json({ ...body, etag:'"repeating"', recurrence:['RRULE:FREQ=DAILY'] })
    throw new Error('Unexpected Calendar request')
  }
  try {
    const result=await pushPending(db)
    assert.equal(result.conflicts,1)
    assert.equal(listChanges().find((change)=>change.enquiryId===enquiry.id)?.kind,'invalid')
    assert.equal(patches,0)
  } finally {globalThis.fetch=originalFetch}
})

test('Calendar 410 full rebuild reviews missing linked event without deleting enquiry', async () => {
  const link = db.prepare('SELECT enquiry_id,event_id FROM calendar_links LIMIT 1').get() as {enquiry_id:string;event_id:string}|undefined
  assert.ok(link)
  db.prepare("UPDATE google_connection SET calendar_sync_token='expired' WHERE id=1").run()
  const originalFetch=globalThis.fetch
  globalThis.fetch=async (resource) => {
    const url=String(resource)
    if (url.includes('syncToken=expired')) return new Response('',{status:410})
    if (url.includes('/events/')) return new Response('',{status:404})
    if (url.includes('/events?')) return Response.json({items:[],nextSyncToken:'fresh-token'})
    throw new Error('Unexpected Google request')
  }
  try {
    const result=await pullChanges(db)
    assert.ok(result.reviewed>=1)
    assert.equal(db.prepare('SELECT calendar_sync_token FROM google_connection WHERE id=1').get()?.calendar_sync_token,'fresh-token')
    assert.ok(getEnquiry(link.enquiry_id))
    assert.equal(listChanges().filter((change)=>change.enquiryId===link.enquiry_id).length,1)
  } finally { globalThis.fetch=originalFetch }
})

test('approving Google deletion keeps enquiry and uses a new event ID for later schedule', async () => {
  const change=listChanges().find((item)=>item.kind==='delete')!
  assert.ok(change)
  const originalLink=db.prepare('SELECT event_id FROM calendar_links WHERE enquiry_id=?').get(change.enquiryId) as {event_id:string}
  const originalFetch=globalThis.fetch
  globalThis.fetch=async (resource, init) => {
    const url=String(resource)
    if (init?.method==='POST') {
      const body=JSON.parse(String(init.body)) as {id:string;start:{dateTime?:string}}
      assert.notEqual(body.id,originalLink.event_id)
      return Response.json({...body,etag:'"restored"'})
    }
    if (url.includes('/events/')) return new Response('',{status:404})
    throw new Error('Unexpected Calendar request')
  }
  try {
    const result=await decideChange(change.id,'approve',change.revision,db)
    assert.equal(result.enquiry.startAt,null)
    assert.ok(getEnquiry(change.enquiryId))
    const planned=scheduleEnquiry(change.enquiryId,result.enquiry.revision,new Date('2099-01-03T22:00:00Z').toISOString(),new Date('2099-01-04T06:00:00Z').toISOString(),'')
    assert.equal(planned.status,'provisional')
    const pushed=await pushPending(db)
    assert.equal(pushed.synced,1)
  } finally { globalThis.fetch=originalFetch }
})

test('calendar selection is blocked while a sync lease is active', async () => {
  const originalFetch=globalThis.fetch
  globalThis.fetch=async (resource) => {
    assert.match(String(resource),/calendarList/)
    return Response.json({items:[{id:'owned-calendar',summary:'Owner',accessRole:'owner'}]})
  }
  assert.equal(acquireSyncLease(db,'test-lease'),true)
  try {
    await assert.rejects(selectCalendar('owned-calendar',db),(error:unknown)=>error instanceof AppError && error.status===409)
  } finally {releaseSyncLease(db,'test-lease');globalThis.fetch=originalFetch}
})

test('calendar decision rechecks revision after awaited Google read', async () => {
  const linked=db.prepare("SELECT enquiry_id,event_id FROM calendar_links WHERE etag='\"restored\"'").get() as {enquiry_id:string;event_id:string}|undefined
  assert.ok(linked)
  const enquiry=getEnquiry(linked.enquiry_id)!
  db.prepare("INSERT INTO change_requests(id,enquiry_id,kind,proposed_start_at,proposed_end_at,proposed_preferred_date,provider_etag,enquiry_revision,status,revision,created_at) VALUES('review-race',?,'move',?,? ,NULL,'\"changed\"',?,'pending',1,?)").run(enquiry.id,'2099-01-05T00:00:00Z','2099-01-05T08:00:00Z',enquiry.revision,new Date().toISOString())
  const originalFetch=globalThis.fetch
  let release!: (response:Response)=>void
  const gate=new Promise<Response>((resolve)=>{release=resolve})
  let requested!:()=>void
  const started=new Promise<void>((resolve)=>{requested=resolve})
  globalThis.fetch=async ()=>{requested();return gate}
  try {
    const deciding=decideChange('review-race','approve',1,db)
    await started
    const newer=scheduleEnquiry(enquiry.id,enquiry.revision,'2099-01-06T00:00:00Z','2099-01-06T08:00:00Z','owner changed plan',db)
    release(Response.json({id:linked.event_id,etag:'"changed"',start:{dateTime:'2099-01-05T00:00:00Z'},end:{dateTime:'2099-01-05T08:00:00Z'}}))
    await assert.rejects(deciding,(error:unknown)=>error instanceof AppError && error.status===409)
    assert.equal(getEnquiry(enquiry.id)?.startAt,newer.startAt)
  } finally {globalThis.fetch=originalFetch}
})

test('stale Google conflict cannot freeze a newer schedule revision', async () => {
  const linked=db.prepare("SELECT enquiry_id,event_id FROM calendar_links WHERE etag='\"restored\"'").get() as {enquiry_id:string;event_id:string}|undefined
  assert.ok(linked)
  const original=getEnquiry(linked.enquiry_id)!
  const first=scheduleEnquiry(original.id,original.revision,'2099-01-07T00:00:00Z','2099-01-07T08:00:00Z','first',db)
  const originalFetch=globalThis.fetch
  let release!: (response:Response)=>void
  const gate=new Promise<Response>((resolve)=>{release=resolve})
  let requested!:()=>void
  const started=new Promise<void>((resolve)=>{requested=resolve})
  globalThis.fetch=async (_resource,init) => {
    if (init?.method==='PATCH') return new Response('',{status:412})
    requested();return gate
  }
  try {
    const syncing=pushPending(db)
    await started
    const newer=scheduleEnquiry(first.id,first.revision,'2099-01-08T00:00:00Z','2099-01-08T08:00:00Z','second',db)
    release(Response.json({id:linked.event_id,etag:'"moved-again"',start:{dateTime:'2099-01-09T00:00:00Z'},end:{dateTime:'2099-01-09T08:00:00Z'}}))
    await syncing
    assert.equal(getEnquiry(original.id)?.revision,newer.revision)
    assert.equal(getEnquiry(original.id)?.calendarStatus,'pending')
    assert.equal(listChanges().filter((change)=>change.enquiryId===original.id).length,0)
  } finally {globalThis.fetch=originalFetch}
})

test('Gmail malformed item is quarantined while valid neighboring messages import', async () => {
  db.prepare("UPDATE google_connection SET selected_calendar_id=NULL,selected_gmail_label_id='Label_1',gmail_page_token=NULL WHERE id=1").run()
  const originalFetch=globalThis.fetch
  const message=(id:string,thread:string)=>({id,threadId:thread,internalDate:'4070908800000',labelIds:['Label_1'],payload:{mimeType:'text/plain',headers:[{name:'From',value:'Customer <customer@example.test>'},{name:'Subject',value:'Kitchen doors'}],body:{data:Buffer.from(`Body ${id}`).toString('base64url')}}})
  let badFixed=false
  globalThis.fetch=async (resource) => {
    const url=String(resource)
    if (url.endsWith('/labels')) return Response.json({labels:[{id:'Label_1',name:'KCP enquiries',type:'user'}]})
    if (url.includes('/messages?')) {
      const u=new URL(url)
      if (u.searchParams.has('pageToken')) return Response.json({messages:[{id:'validC'}]})
      return Response.json({messages:[{id:'validA'},{id:'badB'}],nextPageToken:'second'})
    }
    if (url.includes('/messages/validA')) return Response.json(message('validA','thread-a'))
    if (url.includes('/messages/validC')) return Response.json(message('validC','thread-c'))
    if (url.includes('/messages/badB')) return badFixed ? Response.json(message('badB','thread-b')) : new Response('x'.repeat(3_000_100),{status:200,headers:{'content-type':'application/json'}})
    throw new Error('Unexpected Gmail request')
  }
  try {
    const first=await syncAll() as {gmail:{imported:number}}
    assert.equal(first.gmail.imported,2)
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM gmail_seen WHERE account_sub='approved-sub'").get()?.count,2)
    assert.equal(db.prepare("SELECT reason FROM gmail_quarantine WHERE message_id='badB'").get()?.reason,'payload_too_large')
    badFixed=true
    const second=await syncAll() as {gmail:{imported:number}}
    assert.equal(second.gmail.imported,1)
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM gmail_quarantine WHERE message_id='badB'").get()?.count,0)
  } finally { globalThis.fetch=originalFetch }
})
