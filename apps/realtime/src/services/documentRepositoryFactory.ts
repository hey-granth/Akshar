import { Pool } from "pg";
import { logger } from "../plugins/logger";
import type { AppEnv } from "./env";
import { InMemoryDocumentRepository, type DocumentRepository } from "../modules/document/documentRepository";
import { PostgresDocumentRepository } from "../modules/document/postgresDocumentRepository";

export async function createDocumentRepository(env: AppEnv): Promise<DocumentRepository> {
  if (!env.DATABASE_URL) {
    logger.warn("document.repository.in_memory enabled: DATABASE_URL missing");
    return new InMemoryDocumentRepository();
  }

  const pool = new Pool({
    connectionString: env.DATABASE_URL
  });

  const repository = new PostgresDocumentRepository(pool);
  await repository.init();
  logger.info("document.repository.postgres initialized");
  return repository;
}
