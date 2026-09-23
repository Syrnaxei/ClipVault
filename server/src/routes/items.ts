import { createHash } from 'node:crypto';
import { Router } from 'express';
import db from '../db.js';
import { ApiError } from '../auth.js';
import {
  idParamSchema,
  itemCreateSchema,
  itemUpdateSchema,
  normalizeDevice,
} from '../validation.js';
import { broadcast } from '../ws.js';

const router = Router();

const ITEM_FIELDS =
  'id, clipboard_id, content, content_hash, device, device_type, original_content, created_at';

function getItemOrThrow(id: number) {
  const item = db
    .prepare(`SELECT ${ITEM_FIELDS} FROM clipboard_items WHERE id = ?`)
    .get(id);
  if (!item) {
    throw new ApiError(404, 'NOT_FOUND', 'Item not found');
  }
  return item;
}

router.post('/', (req, res) => {
  const data = itemCreateSchema.parse(req.body);
  const clipboard = db
    .prepare('SELECT id FROM clipboards WHERE uuid = ?')
    .get(data.clipboard_uuid) as { id: number } | undefined;
  if (!clipboard) {
    throw new ApiError(404, 'NOT_FOUND', 'Clipboard not found');
  }
  const { device, device_type } = normalizeDevice(data.device, data.device_type);
  const result = db
    .prepare(
      'INSERT INTO clipboard_items (clipboard_id, content, content_hash, device, device_type) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      clipboard.id,
      data.content,
      createHash('sha256').update(data.content, 'utf8').digest('hex'),
      device,
      device_type,
    );
  const item = getItemOrThrow(result.lastInsertRowid as number);
  res.status(201).json({ item });
  broadcast('item.created', item);
});

router.patch('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = itemUpdateSchema.parse(req.body);
  const item = getItemOrThrow(id) as Record<string, unknown>;
  const content = data.content ?? (item.content as string);
  const contentHash = createHash('sha256').update(content, 'utf8').digest('hex');
  const originalContent =
    data.original_content !== undefined
      ? data.original_content
      : (item.original_content ?? null);
  db.prepare(
    'UPDATE clipboard_items SET content = ?, content_hash = ?, original_content = ? WHERE id = ?',
  ).run(content, contentHash, originalContent, id);
  const updated = getItemOrThrow(id);
  res.json({ item: updated });
  broadcast('item.updated', updated);
});

router.delete('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const item = getItemOrThrow(id);
  db.prepare('DELETE FROM clipboard_items WHERE id = ?').run(id);
  res.status(204).send();
  broadcast('item.deleted', { id, clipboardId: (item as { clipboard_id: number }).clipboard_id });
});

export default router;
