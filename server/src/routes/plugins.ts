import { Router } from 'express';
import db from '../db.js';
import { ApiError } from '../auth.js';
import { idParamSchema, pluginCreateSchema, pluginUpdateSchema } from '../validation.js';

const router = Router();

const PLUGIN_FIELDS =
  'id, name, author, version, description, code, enabled, created_at';

interface PluginRow {
  enabled: number;
  [key: string]: unknown;
}

function serialize(plugin: PluginRow) {
  return { ...plugin, enabled: !!plugin.enabled };
}

function getPluginOrThrow(id: number) {
  const plugin = db
    .prepare(`SELECT ${PLUGIN_FIELDS} FROM plugins WHERE id = ?`)
    .get(id) as PluginRow | undefined;
  if (!plugin) {
    throw new ApiError(404, 'NOT_FOUND', 'Plugin not found');
  }
  return plugin;
}

router.get('/', (req, res) => {
  const plugins = db
    .prepare(`SELECT ${PLUGIN_FIELDS} FROM plugins ORDER BY created_at DESC, id DESC`)
    .all() as PluginRow[];
  res.json({ plugins: plugins.map(serialize) });
});

router.post('/', (req, res) => {
  const data = pluginCreateSchema.parse(req.body);
  const enabled = data.enabled === true ? 1 : 0;
  if (enabled) {
    db.exec('UPDATE plugins SET enabled = 0');
  }
  db.prepare(
    `INSERT INTO plugins (name, author, version, description, code, enabled)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET
       author = excluded.author,
       version = excluded.version,
       description = excluded.description,
       code = excluded.code,
       enabled = excluded.enabled`,
  ).run(data.name, data.author, data.version, data.description, data.code, enabled);
  const plugin = db
    .prepare(`SELECT ${PLUGIN_FIELDS} FROM plugins WHERE name = ?`)
    .get(data.name) as PluginRow;
  res.status(201).json({ plugin: serialize(plugin) });
});

router.patch('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = pluginUpdateSchema.parse(req.body);
  getPluginOrThrow(id);
  if (data.name !== undefined) {
    const conflict = db
      .prepare('SELECT id FROM plugins WHERE name = ? AND id != ?')
      .get(data.name, id);
    if (conflict) {
      throw new ApiError(409, 'CONFLICT', 'Plugin name already exists');
    }
  }
  const existing = getPluginOrThrow(id);
  const enabled = data.enabled === undefined ? (existing.enabled as number) : data.enabled ? 1 : 0;
  if (data.enabled === true) {
    db.exec('UPDATE plugins SET enabled = 0');
  }
  db.prepare(
    `UPDATE plugins SET name = ?, author = ?, version = ?, description = ?, code = ?, enabled = ? WHERE id = ?`,
  ).run(
    data.name ?? (existing.name as string),
    data.author ?? (existing.author as string),
    data.version ?? (existing.version as string),
    data.description ?? (existing.description as string),
    data.code ?? (existing.code as string),
    enabled,
    id,
  );
  const plugin = getPluginOrThrow(id);
  res.json({ plugin: serialize(plugin) });
});

router.delete('/:id', (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  getPluginOrThrow(id);
  db.prepare('DELETE FROM plugins WHERE id = ?').run(id);
  res.status(204).send();
});

export default router;
