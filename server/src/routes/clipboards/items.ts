import { createHash } from 'node:crypto';
import { Router } from 'express';
import db from '../../db.js';
import { ApiError } from '../../auth.js';
import { idParamSchema, itemContentSchema } from '../../validation.js';
import { broadcast } from '../../ws.js';

const router = Router();

function hash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function getClipboardOrThrow(id: number): void {
  const exists = db.prepare('SELECT 1 FROM clipboards WHERE id = ?').get(id);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Clipboard not found');
  }
}

router.get('/:id/items', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  getClipboardOrThrow(id);
  const items = db
    .prepare(
      'SELECT id, clipboard_id, content, content_hash, created_at FROM clipboard_items WHERE clipboard_id = ? ORDER BY created_at DESC',
    )
    .all(id);
  res.json({ items });
});

router.post('/:id/items', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { content } = itemContentSchema.parse(req.body);
  getClipboardOrThrow(id);
  const result = db
    .prepare('INSERT INTO clipboard_items (clipboard_id, content, content_hash) VALUES (?, ?, ?)')
    .run(id, content, hash(content));
  const item = db
    .prepare(
      'SELECT id, clipboard_id, content, content_hash, created_at FROM clipboard_items WHERE id = ?',
    )
    .get(result.lastInsertRowid);
  res.status(201).json({ item });
  broadcast('item.created', item);
});

router.get('/:id/duplicates', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  getClipboardOrThrow(id);
  const rows = db
    .prepare(
      `SELECT content_hash, COUNT(*) AS cnt
       FROM clipboard_items
       WHERE clipboard_id = ?
       GROUP BY content_hash
       HAVING cnt > 1`,
    )
    .all(id) as { content_hash: string; cnt: number }[];
  const itemsStmt = db.prepare(
    'SELECT id, clipboard_id, content, content_hash, created_at FROM clipboard_items WHERE clipboard_id = ? AND content_hash = ? ORDER BY created_at DESC',
  );
  const groups = rows.map((row) => ({
    hash: row.content_hash,
    items: itemsStmt.all(id, row.content_hash),
  }));
  res.json({ groups });
});

export default router;
