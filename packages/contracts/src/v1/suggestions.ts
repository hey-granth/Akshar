import { z } from "zod";
import { VersionSchema } from "./common";

export const DiffOperationSchema = z.object({
  operation: z.enum(["insert", "delete", "replace"]),
  targetBlockId: z.string().uuid(),
  content: z.string().optional(),
  startOffset: z.number().int().nonnegative().optional(),
  endOffset: z.number().int().nonnegative().optional()
});

export const SuggestionDiffSchema = z.object({
  version: VersionSchema,
  suggestionId: z.string().uuid(),
  documentId: z.string().uuid(),
  baseSnapshotVersion: z.number().int().positive(),
  operations: z.array(DiffOperationSchema).min(1),
  reason: z.string().min(1)
});

export const SuggestionActionSchema = z.object({
  version: VersionSchema,
  suggestionId: z.string().uuid(),
  action: z.enum(["accept", "reject"]),
  actedBy: z.string().min(1)
});

export type SuggestionDiff = z.infer<typeof SuggestionDiffSchema>;
