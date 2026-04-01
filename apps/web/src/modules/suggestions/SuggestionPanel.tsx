"use client";

import { useState } from "react";
import type { SuggestionState } from "./types";
import { getRealtimeHttpBase } from "../../services/realtimeClient";

type SuggestionPanelProps = {
  suggestions: SuggestionState[];
  onApplyAction: (suggestionId: string, action: "accept" | "reject") => void;
};

export function SuggestionPanel({ suggestions, onApplyAction }: SuggestionPanelProps) {
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  const handleAction = async (suggestionId: string, action: "accept" | "reject") => {
    setActionInFlight(suggestionId);

    const response = await fetch(`${getRealtimeHttpBase()}/suggestions/${suggestionId}/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        version: "v1",
        suggestionId,
        action,
        actedBy: "web-user"
      })
    });

    if (response.ok) {
      onApplyAction(suggestionId, action);
    }

    setActionInFlight(null);
  };

  return (
    <div className="panel">
      <h3>Suggestions</h3>
      {suggestions.length === 0 ? <p>No suggestions yet.</p> : null}
      {suggestions.map((suggestion) => (
        <div className="suggestion-item" key={suggestion.suggestionId}>
          <p>
            <strong>Reason:</strong> {suggestion.reason}
          </p>
          <p>
            <strong>Ops:</strong> {suggestion.operations.length}
          </p>
          <p>
            <strong>Status:</strong> {suggestion.status}
          </p>
          <button
            className="button"
            disabled={actionInFlight === suggestion.suggestionId || suggestion.status !== "pending"}
            onClick={() => handleAction(suggestion.suggestionId, "accept")}
            type="button"
          >
            Accept
          </button>
          <button
            className="button secondary"
            disabled={actionInFlight === suggestion.suggestionId || suggestion.status !== "pending"}
            onClick={() => handleAction(suggestion.suggestionId, "reject")}
            type="button"
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
