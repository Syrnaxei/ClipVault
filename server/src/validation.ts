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

export const DEVICE_TYPES = ['iPhone', 'iPad', 'Mac', 'PC', 'Web', 'Unknown'] as const;

export const itemContentSchema = z.object({
  content: z.string().min(1).max(1_048_576),
});

export const itemCreateSchema = z.object({
  clipboard_uuid: z.string().uuid(),
  content: z.string().min(1).max(1_048_576),
  device: z.string().trim().max(100).optional(),
  device_type: z.string().optional(),
});

export function normalizeDevice(device?: string, deviceType?: string) {
  if (device === undefined && deviceType === undefined) {
    return { device: null, device_type: null };
  }
  const canonical = DEVICE_TYPES.find(
    (t) => t.toLowerCase() === (deviceType ?? '').toLowerCase(),
  );
  return {
    device: device || null,
    device_type: canonical ?? 'Unknown',
  };
}

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
