import Fastify from "fastify";
import { logger } from "./plugins/logger";
import { loadEnv } from "./services/env";
import { SnapshotService } from "./modules/document/snapshotService";
import { PresenceService } from "./modules/collaboration/presenceService";
import { createHocuspocusService } from "./modules/collaboration/hocuspocusService";
import { registerHealthRoutes } from "./routes/healthRoutes";
import { registerPresenceRoutes } from "./routes/presenceRoutes";
import { InMemorySuggestionRepository } from "./modules/suggestions/suggestionRepository";
import { SuggestionService } from "./modules/suggestions/suggestionService";
import { registerAgentRoutes } from "./routes/agentRoutes";
import { registerSuggestionRoutes } from "./routes/suggestionRoutes";
import { createDocumentRepository } from "./services/documentRepositoryFactory";

async function start(): Promise<void> {
  const env = loadEnv();
  const app = Fastify({ logger: false });

  const repository = await createDocumentRepository(env);
  const snapshotService = new SnapshotService(repository);
  const presenceService = new PresenceService();
  const suggestionRepository = new InMemorySuggestionRepository();
  const suggestionService = new SuggestionService({
    agentBaseUrl: env.AGENT_API_URL,
    repository: suggestionRepository
  });

  const hocuspocus = createHocuspocusService({
    port: env.HOCUSPOCUS_PORT,
    snapshotService,
    presenceService
  });

  await registerHealthRoutes(app);
  await registerPresenceRoutes(app, presenceService);
  await registerAgentRoutes(app, suggestionService);
  await registerSuggestionRoutes(app, suggestionService);

  await app.listen({ port: env.HTTP_PORT, host: "0.0.0.0" });
  await hocuspocus.listen();

  logger.info(
    {
      httpPort: env.HTTP_PORT,
      hocuspocusPort: env.HOCUSPOCUS_PORT
    },
    "realtime.started"
  );
}

start().catch((error) => {
  logger.error({ error }, "realtime.startup.error");
  process.exit(1);
});
