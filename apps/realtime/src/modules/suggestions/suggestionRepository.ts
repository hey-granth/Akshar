import type { SuggestionDiff } from "@akshar/contracts";

export type SuggestionRecord = {
  suggestion: SuggestionDiff;
  status: "pending" | "accepted" | "rejected";
  actedBy?: string;
  actedAt?: string;
};

export class InMemorySuggestionRepository {
  private readonly byId = new Map<string, SuggestionRecord>();

  upsertPending(suggestion: SuggestionDiff): SuggestionRecord {
    const record: SuggestionRecord = {
      suggestion,
      status: "pending"
    };

    this.byId.set(suggestion.suggestionId, record);
    return record;
  }

  getById(suggestionId: string): SuggestionRecord | null {
    return this.byId.get(suggestionId) ?? null;
  }

  markAction(suggestionId: string, action: "accept" | "reject", actedBy: string): SuggestionRecord | null {
    const current = this.byId.get(suggestionId);
    if (!current) {
      return null;
    }

    const next: SuggestionRecord = {
      ...current,
      status: action === "accept" ? "accepted" : "rejected",
      actedBy,
      actedAt: new Date().toISOString()
    };

    this.byId.set(suggestionId, next);
    return next;
  }
}
