import type { FastifyInstance } from "fastify";
import type { PresenceService } from "../modules/collaboration/presenceService";

export async function registerPresenceRoutes(app: FastifyInstance, presenceService: PresenceService): Promise<void> {
  app.get<{ Params: { documentId: string } }>("/documents/:documentId/presence", async (request) => {
    const users = presenceService.getUsers(request.params.documentId);

    return {
      version: "v1",
      documentId: request.params.documentId,
      users
    };
  });
}
