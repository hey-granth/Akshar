import { z } from "zod";

export const VersionSchema = z.literal("v1");

export const RequestMetaSchema = z.object({
  requestId: z.string().min(1),
  timestamp: z.string().datetime()
});

export const ApiErrorSchema = z.object({
  version: VersionSchema,
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.record(z.unknown()).optional()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
