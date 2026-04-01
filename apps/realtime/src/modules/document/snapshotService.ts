import * as Y from "yjs";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { DocumentSnapshotSchema, type DocumentSnapshot } from "@akshar/contracts";
import { logger } from "../../plugins/logger";
import type { DocumentRepository } from "./documentRepository";

export class SnapshotService {
  constructor(private readonly repository: DocumentRepository) { }

  async load(documentId: string): Promise<DocumentSnapshot | null> {
    const snapshot = await this.repository.getLatest(documentId);
    if (!snapshot) {
      logger.info({ documentId }, "snapshot.load.miss");
      return null;
    }

    logger.info({ documentId, snapshotVersion: snapshot.snapshotVersion }, "snapshot.load.hit");
    return DocumentSnapshotSchema.parse(snapshot);
  }

  async saveYDoc(documentId: string, yDoc: Y.Doc, ownerId: string): Promise<DocumentSnapshot> {
    const current = await this.repository.getLatest(documentId);
    const snapshotVersion = (current?.snapshotVersion ?? 0) + 1;
    const update = Y.encodeStateAsUpdate(yDoc);
    const json = TiptapTransformer.fromYdoc(yDoc, "default");
    const blocks = parseBlocks(json?.default?.content ?? []);

    const snapshot: DocumentSnapshot = {
      version: "v1",
      documentId,
      snapshotVersion,
      yjsStateBase64: Buffer.from(update).toString("base64"),
      metadata: current?.metadata ?? {
        title: "Untitled Document",
        ownerId,
        collaborators: [ownerId]
      },
      blocks,
      createdAt: new Date().toISOString()
    };

    logger.info(
      {
        documentId,
        snapshotVersion,
        blockCount: blocks.length
      },
      "snapshot.save.request"
    );

    await this.repository.save(snapshot);

    logger.info({ documentId, snapshotVersion }, "snapshot.save.success");
    return snapshot;
  }
}

type NodeLike = {
  attrs?: Record<string, unknown>;
  type?: string;
  content?: NodeLike[];
  text?: string;
};

function parseBlocks(content: NodeLike[]): DocumentSnapshot["blocks"] {
  return content.map((node, index) => {
    const blockId = typeof node.attrs?.blockId === "string" ? node.attrs.blockId : randomUUID();
    const type = normalizeType(node.type);
    const text = flattenText(node);

    return {
      blockId,
      type,
      content: text,
      order: index
    };
  });
}

function normalizeType(value: string | undefined): DocumentSnapshot["blocks"][number]["type"] {
  if (value === "heading") {
    return "heading";
  }
  if (value === "bulletList") {
    return "bullet_list";
  }
  if (value === "orderedList") {
    return "ordered_list";
  }
  if (value === "codeBlock") {
    return "code_block";
  }
  return "paragraph";
}

function flattenText(node: NodeLike): string {
  if (typeof node.text === "string") {
    return node.text;
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content.map(flattenText).join("");
}
