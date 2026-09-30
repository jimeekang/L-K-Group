import { createHash, randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import type { Enquiry } from '../domain/contracts.ts'
import { AppError, validDate, validateProposedInstants } from '../domain/validation.ts'
import { getDb, transaction, renewSyncLease } from './local-db.ts'
import { getAuthorizedGoogleAccessToken } from './auth.ts'
import { getEnquiry } from './store.ts'

interface GoogleEvent {
  id: string
  etag?: string
  status?: string
  summary?: string
  start?: { date?: string; dateTime?: string; timeZone?: string }
  end?: { date?: string; dateTime?: string; timeZone?: string }
  extendedProperties?: { private?: Record<string,string> }
  recurrence?: string[]
  recurringEventId?: string
}
interface GoogleCalendar { id: string; summary: string; accessRole: string }
interface ListResponse<T> { items?: T[]; nextPageToken?: string; nextSyncToken?: string }

export class GoogleApiError extends Error {
  readonly status: number
  constructor(status: number) { super(status === 401 || status === 403 ? 'Google connection needs review' : 'Google Calendar request failed'); this.status = status }
}

async function googleFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { accessToken } = await getAuthorizedGoogleAccessToken()
  return fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init.headers || {}) },
    cache: 'no-store', signal: AbortSignal.timeout(15000),
  })
}

async function jsonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await googleFetch(path, init)
  if (!response.ok) throw new GoogleApiError(response.status)
  return response.json() as Promise<T>
}

function eventPath(calendarId: string, eventId?: string): string {
  return `/calendars/${encodeURIComponent(calendarId)}/events${eventId ? `/${encodeURIComponent(eventId)}` : ''}`
}

export async function listOwnedCalendars(): Promise<GoogleCalendar[]> {
  const calendars: GoogleCalendar[] = []
  let pageToken: string | undefined
  do {
    const q = new URLSearchParams({ minAccessRole: 'owner', maxResults: '250' })
    if (pageToken) q.set('pageToken', pageToken)
    const page = await jsonRequest<ListResponse<GoogleCalendar>>(`/users/me/calendarList?${q}`)
    calendars.push(...(page.items || []).filter((item) => item.accessRole === 'owner'))
    pageToken = page.nextPageToken
  } while (pageToken && calendars.length < 2000)
  return calendars.map(({ id, summary, accessRole }) => ({ id, summary, accessRole }))
}

export async function selectCalendar(calendarId: string, db = getDb()): Promise<void> {
  if (!calendarId || calendarId.length > 512) throw new AppError(400, 'Invalid calendar')
  const owned = await listOwnedCalendars()
  if (!owned.some((item) => item.id === calendarId)) throw new AppError(403, 'Calendar is not owned by the approved account')
  transaction(db, () => {
    const lease = db.prepare('SELECT expires_at FROM sync_lease WHERE id=1').get() as { expires_at:number } | undefined
    if (lease && lease.expires_at > Date.now()) throw new AppError(409, 'Sync in progress; retry calendar selection')
    const current = db.prepare('SELECT selected_calendar_id FROM google_connection WHERE id=1').get() as { selected_calendar_id:string|null } | undefined
    if (!current) throw new AppError(503, 'Google account is not connected')
    if (current.selected_calendar_id && current.selected_calendar_id !== calendarId) {
      const links = db.prepare('SELECT COUNT(*) AS count FROM calendar_links').get() as { count:number }
      if (links.count > 0) throw new AppError(409, 'Calendar has linked events; migration needs review')
    }
    db.prepare('UPDATE google_connection SET selected_calendar_id=?,calendar_sync_token=NULL,calendar_last_synced_at=NULL,calendar_error=NULL WHERE id=1').run(calendarId)
  })
}

function nextDate(date: string): string { return new Date(Date.parse(`${date}T00:00:00Z`) + 86400000).toISOString().slice(0,10) }
function eventId(id: string): string { return `a${createHash('sha256').update(id).digest('hex').slice(0, 40)}` }
function eventBody(enquiry: Enquiry): GoogleEvent {
  const base = {
    id: eventId(enquiry.id), visibility: 'private', transparency: 'transparent', status:'confirmed', recurrence:[],
    summary: enquiry.startAt ? `KCP provisional · ${enquiry.reference}` : `KCP enquiry · ${enquiry.reference}`,
    description: `Reference ${enquiry.reference}. ${enquiry.startAt ? 'Provisional schedule; owner review required.' : 'Preferred date only; no booking confirmed.'}\n${process.env.APP_BASE_URL}/admin`,
    extendedProperties: { private: { enquiryId: enquiry.id, revision: String(enquiry.revision) } },
  }
  if (enquiry.startAt && enquiry.endAt) return { ...base, start: { dateTime: enquiry.startAt, timeZone: 'Australia/Sydney' }, end: { dateTime: enquiry.endAt, timeZone: 'Australia/Sydney' } }
  const date = enquiry.preferredDate
  if (!date) throw new AppError(409, 'Enquiry has no proposed date')
  return { ...base, start: { date }, end: { date: nextDate(date) } }
}

async function getEvent(calendarId: string, id: string): Promise<GoogleEvent | null> {
  const response = await googleFetch(eventPath(calendarId, id))
  if (response.status === 404 || response.status === 410) return null
  if (!response.ok) throw new GoogleApiError(response.status)
  return response.json() as Promise<GoogleEvent>
}

function conflictFromEvent(db: DatabaseSync, enquiry: Enquiry, event: GoogleEvent | null): void {
  const proposedPreferredDate = event?.start?.date || null
  const proposedStartAt = event?.start?.dateTime || null
  const proposedEndAt = event?.end?.dateTime || null
  const kind = !event || event.status === 'cancelled' ? 'delete' : event.recurrence?.length || event.recurringEventId ? 'invalid' : proposedPreferredDate || validateProposedInstants(proposedStartAt, proposedEndAt) ? 'move' : 'invalid'
  const etag = event?.etag || 'deleted'
  transaction(db, () => {
    const current = getEnquiry(enquiry.id, db)
    if (!current || current.revision !== enquiry.revision) return
    db.prepare("UPDATE change_requests SET status='superseded',revision=revision+1 WHERE enquiry_id=? AND status='pending' AND (provider_etag<>? OR enquiry_revision<>?)").run(enquiry.id, etag, enquiry.revision)
    db.prepare(`INSERT OR IGNORE INTO change_requests(id,enquiry_id,kind,proposed_start_at,proposed_end_at,proposed_preferred_date,provider_etag,enquiry_revision,status,revision,created_at)
      VALUES(?,?,?,?,?,?,?,?, 'pending',1,?)`).run(randomUUID(), enquiry.id, kind, proposedStartAt, proposedEndAt, proposedPreferredDate, etag, enquiry.revision, new Date().toISOString())
    db.prepare("UPDATE enquiries SET calendar_status='conflict',calendar_error='Google Calendar change needs review' WHERE id=? AND revision=?").run(enquiry.id, enquiry.revision)
  })
}

async function pushOne(db: DatabaseSync, calendarId: string, enquiry: Enquiry, outboxRevision: number): Promise<'synced'|'conflict'> {
  const link = db.prepare('SELECT event_id,etag,synced_revision FROM calendar_links WHERE enquiry_id=?').get(enquiry.id) as { event_id:string; etag:string|null; synced_revision:number } | undefined
  const body = eventBody(enquiry)
  const generation = (db.prepare('SELECT event_generation FROM enquiries WHERE id=?').get(enquiry.id) as { event_generation:number }).event_generation
  body.id = eventId(generation === 0 ? enquiry.id : `${enquiry.id}:${generation}`)
  if (link) body.id = link.event_id
  let event: GoogleEvent
  if (!link || !link.etag) {
    const response = await googleFetch(`${eventPath(calendarId)}?sendUpdates=none`, { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify(body) })
    if (response.status === 409) {
      const existing = await getEvent(calendarId, body.id)
      if (!existing || existing.extendedProperties?.private?.enquiryId !== enquiry.id) throw new AppError(409, 'Calendar event ID conflict')
      if (existing.status !== 'cancelled' && !existing.recurrence?.length && !existing.recurringEventId && datesMatch(enquiry, existing) && existing.extendedProperties.private.revision === String(enquiry.revision)) event = existing
      else {
        transaction(db, () => {
          if (getEnquiry(enquiry.id, db)?.revision === enquiry.revision) db.prepare('INSERT OR IGNORE INTO calendar_links(enquiry_id,event_id,etag,synced_revision) VALUES(?,?,?,0)').run(enquiry.id, existing.id, existing.etag || null)
        })
        conflictFromEvent(db, enquiry, existing)
        return 'conflict'
      }
    } else {
      if (!response.ok) throw new GoogleApiError(response.status)
      event = await response.json() as GoogleEvent
    }
  } else {
    const response = await googleFetch(`${eventPath(calendarId, link.event_id)}?sendUpdates=none`, {
      method:'PATCH', headers:{ 'content-type':'application/json', 'If-Match': link.etag }, body:JSON.stringify(body),
    })
    if (response.status === 412 || response.status === 404 || response.status === 410) {
      conflictFromEvent(db, enquiry, await getEvent(calendarId, link.event_id))
      return 'conflict'
    }
    if (!response.ok) throw new GoogleApiError(response.status)
    event = await response.json() as GoogleEvent
  }
  if (!event.id || !event.etag) throw new AppError(502, 'Google returned incomplete event')
  const savedEtag = event.etag
  transaction(db, () => {
    db.prepare(`INSERT INTO calendar_links(enquiry_id,event_id,etag,synced_revision,last_start_at,last_end_at,last_preferred_date)
      VALUES(?,?,?,?,?,?,?) ON CONFLICT(enquiry_id) DO UPDATE SET event_id=excluded.event_id,etag=excluded.etag,synced_revision=excluded.synced_revision,last_start_at=excluded.last_start_at,last_end_at=excluded.last_end_at,last_preferred_date=excluded.last_preferred_date`).run(enquiry.id, event.id, savedEtag, outboxRevision, enquiry.startAt, enquiry.endAt, enquiry.preferredDate)
    db.prepare('DELETE FROM outbox WHERE enquiry_id=? AND revision=?').run(enquiry.id, outboxRevision)
    db.prepare("UPDATE enquiries SET calendar_status='synced',calendar_error=NULL WHERE id=? AND revision=?").run(enquiry.id, outboxRevision)
  })
  return 'synced'
}

export async function pushPending(db = getDb(), leaseHolder?: string): Promise<{ synced:number; conflicts:number; failed:number }> {
  const connection = db.prepare('SELECT selected_calendar_id FROM google_connection WHERE id=1').get() as { selected_calendar_id:string|null } | undefined
  if (!connection?.selected_calendar_id) return { synced:0, conflicts:0, failed:0 }
  const pending = db.prepare(`SELECT o.enquiry_id,o.revision FROM outbox o JOIN enquiries e ON e.id=o.enquiry_id
    WHERE e.calendar_status <> 'conflict' AND ((e.start_at IS NOT NULL AND e.end_at IS NOT NULL) OR json_extract(e.payload_json,'$.preferredDate') IS NOT NULL)
    ORDER BY o.updated_at LIMIT 200`).all() as { enquiry_id:string; revision:number }[]
  const result = { synced:0, conflicts:0, failed:0 }
  for (const item of pending) {
    if (leaseHolder && !renewSyncLease(db, leaseHolder)) throw new AppError(409, 'Sync lease expired')
    const enquiry = getEnquiry(item.enquiry_id, db)
    if (!enquiry || enquiry.revision !== item.revision) continue
    try {
      const status = await pushOne(db, connection.selected_calendar_id, enquiry, item.revision)
      result[status === 'synced' ? 'synced' : 'conflicts']++
    } catch {
      result.failed++
      db.prepare("UPDATE enquiries SET calendar_status='retrying',calendar_error='Calendar sync failed; retry available' WHERE id=? AND revision=?").run(enquiry.id, item.revision)
    }
  }
  return result
}

function datesMatch(enquiry: Enquiry, event: GoogleEvent): boolean {
  if (enquiry.startAt && enquiry.endAt) return !!event.start?.dateTime && !!event.end?.dateTime && Date.parse(event.start.dateTime) === Date.parse(enquiry.startAt) && Date.parse(event.end.dateTime) === Date.parse(enquiry.endAt)
  return event.start?.date === enquiry.preferredDate && event.end?.date === (enquiry.preferredDate ? nextDate(enquiry.preferredDate) : null)
}

export async function pullChanges(db = getDb(), leaseHolder?: string): Promise<{ reviewed:number; scanned:number }> {
  const connection = db.prepare('SELECT selected_calendar_id,calendar_sync_token FROM google_connection WHERE id=1').get() as { selected_calendar_id:string|null; calendar_sync_token:string|null } | undefined
  if (!connection?.selected_calendar_id) return { reviewed:0, scanned:0 }
  let token = connection.calendar_sync_token
  let restarted = false
  let fullScan = !token
  const seenLinkedIds = new Set<string>()
  let pageToken: string | undefined
  let scanned = 0, reviewed = 0
  while (true) {
    if (leaseHolder && !renewSyncLease(db, leaseHolder)) throw new AppError(409, 'Sync lease expired')
    const q = new URLSearchParams({ maxResults:'2500', showDeleted:'true' })
    if (token) q.set('syncToken', token)
    if (pageToken) q.set('pageToken', pageToken)
    const response = await googleFetch(`${eventPath(connection.selected_calendar_id)}?${q}`)
    if (response.status === 410 && token && !restarted) {
      token = null; pageToken = undefined; restarted = true
      fullScan = true
      seenLinkedIds.clear()
      db.prepare('UPDATE google_connection SET calendar_sync_token=NULL WHERE id=1').run()
      continue
    }
    if (!response.ok) throw new GoogleApiError(response.status)
    const page = await response.json() as ListResponse<GoogleEvent>
    for (const event of page.items || []) {
      scanned++
      const link = db.prepare('SELECT enquiry_id,etag FROM calendar_links WHERE event_id=?').get(event.id) as { enquiry_id:string; etag:string|null } | undefined
      if (link) seenLinkedIds.add(event.id)
      if (!link || link.etag === event.etag) continue
      const enquiry = getEnquiry(link.enquiry_id, db)
      if (!enquiry) continue
      if (event.status === 'cancelled' || event.recurrence?.length || event.recurringEventId || !datesMatch(enquiry, event)) { conflictFromEvent(db, enquiry, event); reviewed++ }
      else db.prepare('UPDATE calendar_links SET etag=? WHERE enquiry_id=?').run(event.etag || null, enquiry.id)
    }
    pageToken = page.nextPageToken
    if (!pageToken) {
      if (fullScan) {
        const links = db.prepare('SELECT enquiry_id,event_id,etag FROM calendar_links').all() as {enquiry_id:string;event_id:string;etag:string|null}[]
        for (const link of links) {
          if (seenLinkedIds.has(link.event_id) || !link.etag) continue
          if (leaseHolder && !renewSyncLease(db, leaseHolder)) throw new AppError(409, 'Sync lease expired')
          const event = await getEvent(connection.selected_calendar_id, link.event_id)
          const enquiry = getEnquiry(link.enquiry_id, db)
          if (!enquiry) continue
          if (!event || event.status === 'cancelled' || event.recurrence?.length || event.recurringEventId || !datesMatch(enquiry, event)) { conflictFromEvent(db, enquiry, event); reviewed++ }
          else if (event.etag) db.prepare('UPDATE calendar_links SET etag=? WHERE enquiry_id=?').run(event.etag, enquiry.id)
        }
      }
      if (!page.nextSyncToken) throw new AppError(502, 'Google did not provide a sync cursor')
      db.prepare('UPDATE google_connection SET calendar_sync_token=?,calendar_last_synced_at=?,calendar_error=NULL WHERE id=1 AND selected_calendar_id=?').run(page.nextSyncToken, new Date().toISOString(), connection.selected_calendar_id)
      break
    }
  }
  return { reviewed, scanned }
}

export async function decideChange(id: string, action: 'approve'|'reject', expectedRevision: number, db = getDb()): Promise<{ change: unknown; enquiry: Enquiry }> {
  type PendingRow = { id:string; enquiry_id:string; kind:string; proposed_start_at:string|null; proposed_end_at:string|null; proposed_preferred_date:string|null; provider_etag:string; enquiry_revision:number; status:string; revision:number }
  const row = db.prepare('SELECT * FROM change_requests WHERE id=?').get(id) as PendingRow | undefined
  if (!row || row.status !== 'pending') throw new AppError(404, 'Change request not found')
  if (row.revision !== expectedRevision) throw new AppError(409, 'Change request changed; reload')
  const enquiry = getEnquiry(row.enquiry_id, db)!
  if (enquiry.revision !== row.enquiry_revision) throw new AppError(409, 'Enquiry changed; reload')
  const connection = db.prepare('SELECT selected_calendar_id FROM google_connection WHERE id=1').get() as { selected_calendar_id:string|null } | undefined
  const link = db.prepare('SELECT event_id FROM calendar_links WHERE enquiry_id=?').get(enquiry.id) as { event_id:string } | undefined
  if (!connection?.selected_calendar_id || !link) throw new AppError(409, 'Calendar connection changed')
  const current = await getEvent(connection.selected_calendar_id, link.event_id)
  if ((current?.etag || 'deleted') !== row.provider_etag) throw new AppError(409, 'Google event changed; sync again')
  if (action === 'approve' && row.kind === 'invalid') throw new AppError(400, 'Invalid Google change cannot be approved')
  if (action === 'approve' && row.kind === 'move') {
    if (row.proposed_preferred_date) {
      validDate(row.proposed_preferred_date)
      if (current?.end?.date !== nextDate(row.proposed_preferred_date)) throw new AppError(400, 'Invalid Google all-day end')
    } else if (!validateProposedInstants(row.proposed_start_at, row.proposed_end_at)) throw new AppError(400, 'Invalid Google time range')
  }
  transaction(db, () => {
    const latest = db.prepare('SELECT * FROM change_requests WHERE id=?').get(id) as PendingRow | undefined
    const fresh = getEnquiry(enquiry.id, db)
    const selected = db.prepare('SELECT selected_calendar_id FROM google_connection WHERE id=1').get() as {selected_calendar_id:string|null}|undefined
    const mapped = db.prepare('SELECT event_id FROM calendar_links WHERE enquiry_id=?').get(enquiry.id) as {event_id:string}|undefined
    if (!latest || latest.status !== 'pending' || latest.revision !== expectedRevision || latest.enquiry_revision !== fresh?.revision || selected?.selected_calendar_id !== connection.selected_calendar_id || mapped?.event_id !== link.event_id) throw new AppError(409, 'Enquiry or calendar changed; reload')
    if (action === 'approve' && row.kind === 'move') {
      if (row.proposed_preferred_date) {
        const payload = JSON.parse((db.prepare('SELECT payload_json FROM enquiries WHERE id=?').get(enquiry.id) as {payload_json:string}).payload_json) as Record<string, unknown>
        payload.preferredDate = row.proposed_preferred_date
        db.prepare("UPDATE enquiries SET payload_json=?,start_at=NULL,end_at=NULL,status='submitted',revision=revision+1,calendar_status='pending',calendar_error=NULL WHERE id=?").run(JSON.stringify(payload), enquiry.id)
      } else {
        db.prepare("UPDATE enquiries SET start_at=?,end_at=?,status='provisional',revision=revision+1,calendar_status='pending',calendar_error=NULL WHERE id=?").run(new Date(row.proposed_start_at!).toISOString(), new Date(row.proposed_end_at!).toISOString(), enquiry.id)
      }
    } else if (action === 'approve' && row.kind === 'delete') {
      const payload = JSON.parse((db.prepare('SELECT payload_json FROM enquiries WHERE id=?').get(enquiry.id) as {payload_json:string}).payload_json) as Record<string, unknown>
      payload.preferredDate = null
      db.prepare("UPDATE enquiries SET payload_json=?,start_at=NULL,end_at=NULL,status='submitted',revision=revision+1,event_generation=event_generation+1,calendar_status='synced',calendar_error=NULL WHERE id=?").run(JSON.stringify(payload), enquiry.id)
      db.prepare('DELETE FROM calendar_links WHERE enquiry_id=?').run(enquiry.id)
      db.prepare('DELETE FROM outbox WHERE enquiry_id=?').run(enquiry.id)
    } else db.prepare("UPDATE enquiries SET calendar_status='pending',calendar_error=NULL WHERE id=?").run(enquiry.id)
    const updated = getEnquiry(enquiry.id, db)!
    if (!(action === 'approve' && row.kind === 'delete')) {
      if (action === 'reject' && row.kind === 'delete' && !current) {
        const restoredEventId = eventId(`${enquiry.id}:${row.id}`)
        db.prepare('UPDATE calendar_links SET event_id=?,etag=NULL WHERE enquiry_id=?').run(restoredEventId, enquiry.id)
      } else db.prepare('UPDATE calendar_links SET etag=? WHERE enquiry_id=?').run(current?.etag || null, enquiry.id)
      db.prepare('INSERT INTO outbox(enquiry_id,revision,updated_at) VALUES(?,?,?) ON CONFLICT(enquiry_id) DO UPDATE SET revision=excluded.revision,updated_at=excluded.updated_at').run(enquiry.id, updated.revision, new Date().toISOString())
    }
    db.prepare('UPDATE change_requests SET status=?,revision=revision+1 WHERE id=?').run(action === 'approve' ? 'approved' : 'rejected', id)
    db.prepare("UPDATE change_requests SET status='superseded',revision=revision+1 WHERE enquiry_id=? AND id<>? AND status='pending'").run(enquiry.id, id)
  })
  return { change: { id, status: action === 'approve' ? 'approved' : 'rejected' }, enquiry: getEnquiry(enquiry.id, db)! }
}
