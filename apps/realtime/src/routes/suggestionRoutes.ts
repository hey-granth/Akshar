import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { SuggestionService } from "../modules/suggestions/suggestionService";

export async function registerSuggestionRoutes(app: FastifyInstance, suggestionService: SuggestionService): Promise<void> {
  app.post<{ Params: { suggestionId: string } }>("/suggestions/:suggestionId/actions", async (request, reply) => {
    try {
      const response = suggestionService.applyAction({
        ...(request.body as Record<string, unknown>),
        suggestionId: request.params.suggestionId
      });

      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          version: "v1",
          code: "VALIDATION_ERROR",
          message: "Invalid suggestion action",
          details: {
            issues: error.issues
          }
        });
      }

      if (error instanceof Error) {
        return reply.status(500).send({
          version: "v1",
          code: "SUGGESTION_ACTION_ERROR",
          message: error.message
        });
      }

      return reply.status(500).send({
        version: "v1",
        code: "UNKNOWN_ERROR",
        message: "Unknown error"
      });
    }
  });
}
