import { z } from "zod";
import { VersionSchema } from "./common";

export const DocumentBlockSchema = z.object({
  blockId: z.string().uuid(),
  type: z.enum(["paragraph", "heading", "bullet_list", "ordered_list", "code_block"]),
  content: z.string(),
  order: z.number().int().nonnegative()
});

export const DocumentMetadataSchema = z.object({
  title: z.string().min(1),
  ownerId: z.string().min(1),
  collaborators: z.array(z.string().min(1)).default([])
});

export const DocumentSnapshotSchema = z.object({
  version: VersionSchema,
  documentId: z.string().uuid(),
  snapshotVersion: z.number().int().positive(),
  yjsStateBase64: z.string().min(1),
  metadata: DocumentMetadataSchema,
  blocks: z.array(DocumentBlockSchema),
  createdAt: z.string().datetime()
});

export type DocumentSnapshot = z.infer<typeof DocumentSnapshotSchema>;
