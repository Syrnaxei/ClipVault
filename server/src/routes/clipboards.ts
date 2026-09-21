import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import db from '../db.js';
import { ApiError } from '../auth.js';
import {
  clipboardNameSchema,
  clipboardUpdateSchema,
  idParamSchema,
  uuidParamSchema,
} from '../validation.js';
import itemsRouter from './clipboards/items.js';
import { broadcast } from '../ws.js';

const router = Router();

router.use(itemsRouter);

function toClipboard(row: any) {
  return { ...row, pinned: !!row.pinned };
}

router.get('/', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT c.id, c.name, c.uuid, c.pinned, c.created_at,
              COUNT(i.id) AS item_count,
              MAX(i.created_at) AS latest_item_at
       FROM clipboards c
       LEFT JOIN clipboard_items i ON i.clipboard_id = c.id
       GROUP BY c.id
       ORDER BY c.pinned DESC, c.created_at ASC`,
    )
    .all();
  res.json({ clipboards: rows.map(toClipboard) });
});

router.get('/by-uuid/:uuid', (req, res) => {
  const { uuid } = uuidParamSchema.parse(req.params);
  const row = db
    .prepare('SELECT id, name, uuid, pinned, created_at FROM clipboards WHERE uuid = ?')
    .get(uuid);
  if (!row) {
    throw new ApiError(404, 'NOT_FOUND', 'Clipboard not found');
  }
  res.json({ clipboard: toClipboard(row) });
});

router.post('/', (req, res) => {
  const { name } = clipboardNameSchema.parse(req.body);
  const result = db
    .prepare('INSERT INTO clipboards (name, uuid) VALUES (?, ?)')
    .run(name, randomUUID());
  const clipboard = db
    .prepare('SELECT id, name, uuid, pinned, created_at FROM clipboards WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json({ clipboard: toClipboard(clipboard) });
  broadcast('clipboard.created', toClipboard(clipboard));
});

router.patch('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = clipboardUpdateSchema.parse(req.body);

  const existing = db.prepare('SELECT id FROM clipboards WHERE id = ?').get(id);
  if (!existing) {
    throw new ApiError(404, 'NOT_FOUND', 'Clipboard not found');
  }

  const sets: string[] = [];
  const values: (string | number)[] = [];
  if (data.name !== undefined) {
    sets.push('name = ?');
    values.push(data.name);
  }
  if (data.uuid !== undefined) {
    sets.push('uuid = ?');
    values.push(data.uuid);
  }
  if (data.pinned !== undefined) {
    sets.push('pinned = ?');
    values.push(data.pinned ? 1 : 0);
  }

  try {
    db.prepare(`UPDATE clipboards SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
  } catch (err: any) {
    if (String(err?.code ?? '').startsWith('SQLITE_CONSTRAINT')) {
      throw new ApiError(409, 'CONFLICT', 'UUID already in use');
    }
    throw err;
  }

  const clipboard = db
    .prepare('SELECT id, name, uuid, pinned, created_at FROM clipboards WHERE id = ?')
    .get(id);
  res.json({ clipboard: toClipboard(clipboard) });
  broadcast('clipboard.updated', toClipboard(clipboard));
});

router.delete('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const result = db.prepare('DELETE FROM clipboards WHERE id = ?').run(id);
  if (result.changes === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Clipboard not found');
  }
  res.status(204).send();
  broadcast('clipboard.deleted', { id });
});

export default router;
