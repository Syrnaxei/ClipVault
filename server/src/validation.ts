import { z } from 'zod';

export const clipboardNameSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const itemContentSchema = z.object({
  content: z.string().min(1).max(1_048_576),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
