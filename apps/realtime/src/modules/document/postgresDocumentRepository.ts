import { Pool } from "pg";
import type { DocumentSnapshot } from "@akshar/contracts";
import type { DocumentRepository } from "./documentRepository";

export class PostgresDocumentRepository implements DocumentRepository {
  constructor(private readonly pool: Pool) { }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS document_snapshots (
        id BIGSERIAL PRIMARY KEY,
        document_id UUID NOT NULL,
        snapshot_version INTEGER NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(document_id, snapshot_version)
      );
    `);
  }

  async getLatest(documentId: string): Promise<DocumentSnapshot | null> {
    const result = await this.pool.query<{ payload: DocumentSnapshot }>(
      `
      SELECT payload
      FROM document_snapshots
      WHERE document_id = $1
      ORDER BY snapshot_version DESC
      LIMIT 1;
      `,
      [documentId]
    );

    return result.rows[0]?.payload ?? null;
  }

  async save(snapshot: DocumentSnapshot): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO document_snapshots (document_id, snapshot_version, payload)
      VALUES ($1, $2, $3::jsonb)
      ON CONFLICT (document_id, snapshot_version) DO UPDATE
      SET payload = EXCLUDED.payload;
      `,
      [snapshot.documentId, snapshot.snapshotVersion, JSON.stringify(snapshot)]
    );
  }
}
