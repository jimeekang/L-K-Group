import { mkdirSync, chmodSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

let instance: DatabaseSync | null = null

export function localEnabled(): boolean {
  const base = process.env.APP_BASE_URL
  if (process.env.LOCAL_OPERATIONS_ENABLED !== 'true' || !base) return false
  try {
    const url = new URL(base)
    return (url.hostname === '127.0.0.1' || url.hostname === 'localhost') && url.protocol === 'http:'
  } catch {
    return false
  }
}

export function getDb(): DatabaseSync {
  if (!localEnabled()) throw new Error('Local operations are not enabled')
  if (instance) return instance
  const path = resolve(process.env.LOCAL_OPERATIONS_DB_PATH || '.local/operations.sqlite')
  const directory = dirname(path)
  const createdDirectory = !existsSync(directory)
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  if (createdDirectory) chmodSync(directory, 0o700)
  const db = new DatabaseSync(path)
  chmodSync(path, 0o600)
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;')
  db.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL, idempotency_key TEXT UNIQUE,
      payload_hash TEXT, payload_json TEXT NOT NULL,
      status TEXT NOT NULL, revision INTEGER NOT NULL,
      created_at TEXT NOT NULL, start_at TEXT, end_at TEXT,
      schedule_notes TEXT, calendar_status TEXT NOT NULL,
      calendar_error TEXT, sender_review_required INTEGER NOT NULL DEFAULT 0,
      attachment_count INTEGER NOT NULL DEFAULT 0,
      event_generation INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, mode TEXT NOT NULL,
      account_sub TEXT, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS oauth_states (
      state_hash TEXT PRIMARY KEY, nonce_hash TEXT NOT NULL,
      verifier TEXT NOT NULL, session_hash TEXT,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS google_connection (
      id INTEGER PRIMARY KEY CHECK(id=1), account_sub TEXT NOT NULL,
      email TEXT NOT NULL, access_cipher TEXT NOT NULL,
      refresh_cipher TEXT, expires_at INTEGER NOT NULL,
      selected_calendar_id TEXT, calendar_sync_token TEXT,
      calendar_last_synced_at TEXT, calendar_error TEXT,
      selected_gmail_label_id TEXT, gmail_last_synced_at TEXT,
      gmail_error TEXT, gmail_page_token TEXT
    );
    CREATE TABLE IF NOT EXISTS calendar_links (
      enquiry_id TEXT PRIMARY KEY REFERENCES enquiries(id),
      event_id TEXT NOT NULL UNIQUE, etag TEXT,
      synced_revision INTEGER NOT NULL DEFAULT 0,
      last_start_at TEXT, last_end_at TEXT, last_preferred_date TEXT
    );
    CREATE TABLE IF NOT EXISTS outbox (
      enquiry_id TEXT PRIMARY KEY REFERENCES enquiries(id),
      revision INTEGER NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS change_requests (
      id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL REFERENCES enquiries(id),
      kind TEXT NOT NULL, proposed_start_at TEXT,
      proposed_end_at TEXT, proposed_preferred_date TEXT,
      provider_etag TEXT, enquiry_revision INTEGER NOT NULL,
      status TEXT NOT NULL, revision INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(enquiry_id, provider_etag, enquiry_revision)
    );
    CREATE TABLE IF NOT EXISTS gmail_seen (
      account_sub TEXT NOT NULL, message_id TEXT NOT NULL,
      enquiry_id TEXT NOT NULL REFERENCES enquiries(id),
      PRIMARY KEY(account_sub,message_id)
    );
    CREATE TABLE IF NOT EXISTS gmail_threads (
      account_sub TEXT NOT NULL, thread_id TEXT NOT NULL,
      enquiry_id TEXT NOT NULL REFERENCES enquiries(id),
      PRIMARY KEY(account_sub,thread_id)
    );
    CREATE TABLE IF NOT EXISTS gmail_quarantine (
      account_sub TEXT NOT NULL, message_id TEXT NOT NULL,
      reason TEXT NOT NULL, first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      PRIMARY KEY(account_sub,message_id)
    );
    CREATE TABLE IF NOT EXISTS sync_lease (
      id INTEGER PRIMARY KEY CHECK(id=1), holder TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rate_buckets (
      bucket TEXT PRIMARY KEY, count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );
  `)
  const ensureColumn = (table:string, column:string, definition:string) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[]
    if (!columns.some((item) => item.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
  ensureColumn('enquiries','event_generation','INTEGER NOT NULL DEFAULT 0')
  ensureColumn('google_connection','gmail_page_token','TEXT')
  ensureColumn('change_requests','proposed_preferred_date','TEXT')
  ensureColumn('change_requests','enquiry_revision','INTEGER NOT NULL DEFAULT 1')
  const changeSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='change_requests'").get() as {sql:string}
  if (/UNIQUE\s*\(\s*enquiry_id\s*,\s*provider_etag\s*\)/i.test(changeSchema.sql)) {
    db.exec(`BEGIN IMMEDIATE;
      CREATE TABLE change_requests_new (
        id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL REFERENCES enquiries(id),
        kind TEXT NOT NULL, proposed_start_at TEXT, proposed_end_at TEXT,
        proposed_preferred_date TEXT, provider_etag TEXT,
        enquiry_revision INTEGER NOT NULL, status TEXT NOT NULL,
        revision INTEGER NOT NULL, created_at TEXT NOT NULL,
        UNIQUE(enquiry_id,provider_etag,enquiry_revision)
      );
      INSERT INTO change_requests_new SELECT id,enquiry_id,kind,proposed_start_at,proposed_end_at,proposed_preferred_date,provider_etag,enquiry_revision,status,revision,created_at FROM change_requests;
      DROP TABLE change_requests;
      ALTER TABLE change_requests_new RENAME TO change_requests;
      COMMIT;`)
  }
  instance = db
  return db
}

export function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const value = work()
    db.exec('COMMIT')
    return value
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function acquireSyncLease(db: DatabaseSync, holder: string): boolean {
  const now = Date.now()
  return transaction(db, () => {
    const row = db.prepare('SELECT holder,expires_at FROM sync_lease WHERE id=1').get() as { holder: string; expires_at: number } | undefined
    if (row && row.expires_at > now && row.holder !== holder) return false
    db.prepare('INSERT INTO sync_lease(id,holder,expires_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET holder=excluded.holder,expires_at=excluded.expires_at').run(holder, now + 600000)
    return true
  })
}

export function releaseSyncLease(db: DatabaseSync, holder: string): void {
  db.prepare('DELETE FROM sync_lease WHERE id=1 AND holder=?').run(holder)
}

export function renewSyncLease(db: DatabaseSync, holder: string): boolean {
  const result = db.prepare('UPDATE sync_lease SET expires_at=? WHERE id=1 AND holder=? AND expires_at>?').run(Date.now() + 600000, holder, Date.now())
  return result.changes === 1
}
