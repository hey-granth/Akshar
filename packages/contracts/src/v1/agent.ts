import { z } from "zod";
import { VersionSchema } from "./common";
import { SuggestionDiffSchema } from "./suggestions";

export const AgentContextBlockSchema = z.object({
  blockId: z.string().uuid(),
  content: z.string(),
  score: z.number().min(0).max(1).optional()
});

export const RewriteSectionRequestSchema = z.object({
  version: VersionSchema,
  documentId: z.string().uuid(),
  sectionId: z.string().uuid(),
  content: z.string().min(1),
  context: z.array(AgentContextBlockSchema),
  tone: z.string().default("neutral")
});

export const SummarizeDocumentRequestSchema = z.object({
  version: VersionSchema,
  documentId: z.string().uuid(),
  targetSectionIds: z.array(z.string().uuid()).min(1),
  context: z.array(AgentContextBlockSchema)
});

export const AgentSuggestionResponseSchema = z.object({
  version: VersionSchema,
  requestId: z.string().min(1),
  suggestion: SuggestionDiffSchema
});

export const AgentEnqueueJobResponseSchema = z.object({
  version: VersionSchema,
  taskId: z.string().min(1)
});

export type RewriteSectionRequest = z.infer<typeof RewriteSectionRequestSchema>;
export type SummarizeDocumentRequest = z.infer<typeof SummarizeDocumentRequestSchema>;
