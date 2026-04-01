import {
  AgentEnqueueJobResponseSchema,
  AgentSuggestionResponseSchema,
  RewriteSectionRequestSchema,
  SuggestionActionSchema,
  SummarizeDocumentRequestSchema
} from "@akshar/contracts";
import { logger } from "../../plugins/logger";
import { InMemorySuggestionRepository } from "./suggestionRepository";

type SuggestionServiceOptions = {
  agentBaseUrl: string;
  repository: InMemorySuggestionRepository;
};

export class SuggestionService {
  constructor(private readonly options: SuggestionServiceOptions) { }

  async requestRewrite(input: unknown) {
    const payload = RewriteSectionRequestSchema.parse(input);
    logger.info({ payload }, "suggestion.rewrite.input");

    const response = await fetch(`${this.options.agentBaseUrl}/rewrite-section`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error({ status: response.status, text }, "suggestion.rewrite.error");
      throw new Error(`Agent rewrite failed with status ${response.status}`);
    }

    const json = await response.json();
    const parsed = AgentSuggestionResponseSchema.parse(json);
    this.options.repository.upsertPending(parsed.suggestion);
    logger.info({ suggestionId: parsed.suggestion.suggestionId }, "suggestion.rewrite.output");
    return parsed;
  }

  async requestSummary(input: unknown) {
    const payload = SummarizeDocumentRequestSchema.parse(input);
    logger.info({ payload }, "suggestion.summary.input");

    const response = await fetch(`${this.options.agentBaseUrl}/summarize-document`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error({ status: response.status, text }, "suggestion.summary.error");
      throw new Error(`Agent summarize failed with status ${response.status}`);
    }

    const json = await response.json();
    const parsed = AgentSuggestionResponseSchema.parse(json);
    this.options.repository.upsertPending(parsed.suggestion);
    logger.info({ suggestionId: parsed.suggestion.suggestionId }, "suggestion.summary.output");
    return parsed;
  }

  async enqueueRewrite(input: unknown) {
    const payload = RewriteSectionRequestSchema.parse(input);
    logger.info({ payload }, "suggestion.rewrite.enqueue.input");

    const response = await fetch(`${this.options.agentBaseUrl}/jobs/rewrite-section`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error({ status: response.status, text }, "suggestion.rewrite.enqueue.error");
      throw new Error(`Agent rewrite enqueue failed with status ${response.status}`);
    }

    const json = await response.json();
    const parsed = AgentEnqueueJobResponseSchema.parse(json);
    logger.info({ taskId: parsed.taskId }, "suggestion.rewrite.enqueue.output");
    return parsed;
  }

  async enqueueSummary(input: unknown) {
    const payload = SummarizeDocumentRequestSchema.parse(input);
    logger.info({ payload }, "suggestion.summary.enqueue.input");

    const response = await fetch(`${this.options.agentBaseUrl}/jobs/summarize-document`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error({ status: response.status, text }, "suggestion.summary.enqueue.error");
      throw new Error(`Agent summary enqueue failed with status ${response.status}`);
    }

    const json = await response.json();
    const parsed = AgentEnqueueJobResponseSchema.parse(json);
    logger.info({ taskId: parsed.taskId }, "suggestion.summary.enqueue.output");
    return parsed;
  }

  applyAction(input: unknown) {
    const payload = SuggestionActionSchema.parse(input);
    logger.info({ payload }, "suggestion.action.input");

    const record = this.options.repository.markAction(payload.suggestionId, payload.action, payload.actedBy);
    if (!record) {
      throw new Error("Suggestion not found");
    }

    logger.info({ suggestionId: payload.suggestionId, status: record.status }, "suggestion.action.output");
    return {
      version: "v1" as const,
      suggestionId: payload.suggestionId,
      status: record.status
    };
  }
}
