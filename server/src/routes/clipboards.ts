import { Router } from 'express';
import db from '../db.js';
import { ApiError } from '../auth.js';
import { clipboardNameSchema, idParamSchema } from '../validation.js';
import itemsRouter from './clipboards/items.js';
import { broadcast } from '../ws.js';

const router = Router();

router.use(itemsRouter);

router.get('/', (_req, res) => {
  const clipboards = db
    .prepare(
      `SELECT c.id, c.name, c.created_at,
              COUNT(i.id) AS item_count,
              MAX(i.created_at) AS latest_item_at
       FROM clipboards c
       LEFT JOIN clipboard_items i ON i.clipboard_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at ASC`,
    )
    .all();
  res.json({ clipboards });
});

router.post('/', (req, res) => {
  const { name } = clipboardNameSchema.parse(req.body);
  const result = db.prepare('INSERT INTO clipboards (name) VALUES (?)').run(name);
  const clipboard = db
    .prepare('SELECT id, name, created_at FROM clipboards WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json({ clipboard });
  broadcast('clipboard.created', clipboard);
});

router.patch('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { name } = clipboardNameSchema.parse(req.body);
  const result = db
    .prepare('UPDATE clipboards SET name = ? WHERE id = ?')
    .run(name, id);
  if (result.changes === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Clipboard not found');
  }
  const clipboard = db
    .prepare('SELECT id, name, created_at FROM clipboards WHERE id = ?')
    .get(id);
  res.json({ clipboard });
  broadcast('clipboard.renamed', clipboard);
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
