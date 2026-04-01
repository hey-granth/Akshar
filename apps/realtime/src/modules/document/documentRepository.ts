import { randomUUID } from "node:crypto";
import type { DocumentSnapshot } from "@akshar/contracts";

export interface DocumentRepository {
  getLatest(documentId: string): Promise<DocumentSnapshot | null>;
  save(snapshot: DocumentSnapshot): Promise<void>;
}

export class InMemoryDocumentRepository implements DocumentRepository {
  private readonly byDocumentId = new Map<string, DocumentSnapshot[]>();

  async getLatest(documentId: string): Promise<DocumentSnapshot | null> {
    const snapshots = this.byDocumentId.get(documentId) ?? [];
    return snapshots.at(-1) ?? null;
  }

  async save(snapshot: DocumentSnapshot): Promise<void> {
    const snapshots = this.byDocumentId.get(snapshot.documentId) ?? [];
    this.byDocumentId.set(snapshot.documentId, [...snapshots, snapshot]);
  }
}

export function createInitialSnapshot(documentId: string, ownerId: string): DocumentSnapshot {
  return {
    version: "v1",
    documentId,
    snapshotVersion: 1,
    yjsStateBase64: "",
    metadata: {
      title: "Untitled Document",
      ownerId,
      collaborators: [ownerId]
    },
    blocks: [
      {
        blockId: randomUUID(),
        type: "paragraph",
        content: "",
        order: 0
      }
    ],
    createdAt: new Date().toISOString()
  };
}
