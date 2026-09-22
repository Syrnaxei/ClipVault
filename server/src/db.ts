import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import { config } from './config.js';

fs.mkdirSync(config.dataDir, { recursive: true });

const db = new Database(path.join(config.dataDir, 'clipvault.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS clipboards (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    uuid        TEXT    NOT NULL UNIQUE,
    pinned      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS clipboard_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    clipboard_id INTEGER NOT NULL REFERENCES clipboards(id) ON DELETE CASCADE,
    content      TEXT    NOT NULL,
    content_hash TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_items_clipboard_time ON clipboard_items(clipboard_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_items_hash ON clipboard_items(clipboard_id, content_hash);
`);

const clipboardColumns = (
  db.pragma('table_info(clipboards)') as { name: string }[]
).map((col) => col.name);
if (!clipboardColumns.includes('uuid')) {
  db.exec('ALTER TABLE clipboards ADD COLUMN uuid TEXT');
  const missing = db.prepare('SELECT id FROM clipboards WHERE uuid IS NULL').all() as {
    id: number;
  }[];
  const backfill = db.prepare('UPDATE clipboards SET uuid = ? WHERE id = ?');
  for (const row of missing) {
    backfill.run(randomUUID(), row.id);
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_clipboards_uuid ON clipboards(uuid)');
}

if (!clipboardColumns.includes('pinned')) {
  db.exec('ALTER TABLE clipboards ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0');
}

const itemColumns = (
  db.pragma('table_info(clipboard_items)') as { name: string }[]
).map((col) => col.name);

if (!itemColumns.includes('device')) {
  db.exec('ALTER TABLE clipboard_items ADD COLUMN device TEXT');
}

if (!itemColumns.includes('device_type')) {
  db.exec('ALTER TABLE clipboard_items ADD COLUMN device_type TEXT');
}

export default db;
