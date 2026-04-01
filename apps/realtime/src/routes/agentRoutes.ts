import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import type { SuggestionService } from "../modules/suggestions/suggestionService";

export async function registerAgentRoutes(app: FastifyInstance, suggestionService: SuggestionService): Promise<void> {
  app.post("/agent/rewrite-section", async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
    try {
      const response = await suggestionService.requestRewrite(request.body);
      return response;
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post("/agent/summarize-document", async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
    try {
      const response = await suggestionService.requestSummary(request.body);
      return response;
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post(
    "/agent/jobs/rewrite-section",
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      try {
        const response = await suggestionService.enqueueRewrite(request.body);
        return response;
      } catch (error) {
        return handleError(reply, error);
      }
    }
  );

  app.post(
    "/agent/jobs/summarize-document",
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      try {
        const response = await suggestionService.enqueueSummary(request.body);
        return response;
      } catch (error) {
        return handleError(reply, error);
      }
    }
  );
}

function handleError(reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      version: "v1",
      code: "VALIDATION_ERROR",
      message: "Invalid request payload",
      details: {
        issues: error.issues
      }
    });
  }

  if (error instanceof Error) {
    return reply.status(500).send({
      version: "v1",
      code: "INTERNAL_ERROR",
      message: error.message
    });
  }

  return reply.status(500).send({
    version: "v1",
    code: "UNKNOWN_ERROR",
    message: "Unknown error"
  });
}
