import type { SuggestionDiff } from "@akshar/contracts";

export type SuggestionState = SuggestionDiff & {
  status: "pending" | "accepted" | "rejected";
};
