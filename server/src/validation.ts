import { z } from 'zod';

export const clipboardNameSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const clipboardUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    uuid: z.string().uuid().optional(),
    pinned: z.boolean().optional(),
  })
  .refine((v) => v.name !== undefined || v.uuid !== undefined || v.pinned !== undefined, {
    message: 'At least one of name, uuid, pinned is required',
  });

export const uuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export const itemContentSchema = z.object({
  content: z.string().min(1).max(1_048_576),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
