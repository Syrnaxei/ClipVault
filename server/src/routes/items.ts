import { createHash } from 'node:crypto';
import { Router } from 'express';
import db from '../db.js';
import { ApiError } from '../auth.js';
import { idParamSchema, itemContentSchema } from '../validation.js';
import { broadcast } from '../ws.js';

const router = Router();

function getItemOrThrow(id: number) {
  const item = db
    .prepare(
      'SELECT id, clipboard_id, content, content_hash, created_at FROM clipboard_items WHERE id = ?',
    )
    .get(id);
  if (!item) {
    throw new ApiError(404, 'NOT_FOUND', 'Item not found');
  }
  return item;
}

router.patch('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { content } = itemContentSchema.parse(req.body);
  getItemOrThrow(id);
  const contentHash = createHash('sha256').update(content, 'utf8').digest('hex');
  db.prepare('UPDATE clipboard_items SET content = ?, content_hash = ? WHERE id = ?').run(
    content,
    contentHash,
    id,
  );
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
