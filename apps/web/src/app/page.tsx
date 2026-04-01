"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { SuggestionDiff } from "@akshar/contracts";
import { CollaborativeEditor } from "../modules/editor/CollaborativeEditor";
import { SuggestionPanel } from "../modules/suggestions/SuggestionPanel";
import type { SuggestionState } from "../modules/suggestions/types";
import { applySuggestionDiff } from "../modules/suggestions/applySuggestionDiff";
import { postAgentAction } from "../services/realtimeClient";

const documentId = "2e6f8cb3-a90b-49e7-b163-e2e0d15db034";

export default function HomePage() {
  const userId = useMemo(() => globalThis.crypto.randomUUID(), []);
  const [sectionId, setSectionId] = useState("1ad864c1-6689-4cdf-8506-267bb8de57f8");
  const [content, setContent] = useState("Write clearly and keep the structure explicit.");
  const [suggestions, setSuggestions] = useState<SuggestionState[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleGenerateRewrite = async () => {
    const response = await postAgentAction("/agent/rewrite-section", {
      version: "v1",
      documentId,
      sectionId,
      content,
      context: []
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { suggestion: SuggestionDiff };
    setSuggestions((current: SuggestionState[]) => [...current, { ...payload.suggestion, status: "pending" }]);
  };

  const handleGenerateSummary = async () => {
    const response = await postAgentAction("/agent/summarize-document", {
      version: "v1",
      documentId,
      targetSectionIds: [sectionId],
      context: []
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { suggestion: SuggestionDiff };
    setSuggestions((current: SuggestionState[]) => [...current, { ...payload.suggestion, status: "pending" }]);
  };

  const handleApplyAction = (suggestionId: string, action: "accept" | "reject") => {
    const matchedSuggestion = suggestions.find((item: SuggestionState) => item.suggestionId === suggestionId);
    if (action === "accept" && matchedSuggestion && editor) {
      applySuggestionDiff(editor, matchedSuggestion);
    }

    setSuggestions((current: SuggestionState[]) =>
      current.map((item: SuggestionState) => {
        if (item.suggestionId !== suggestionId) {
          return item;
        }
        return {
          ...item,
          status: action === "accept" ? "accepted" : "rejected"
        };
      })
    );
  };

  return (
    <main>
      <h1>Akshar MVP</h1>

      <div className="panel">
        <label htmlFor="section-id">Section ID</label>
        <input
          id="section-id"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSectionId(event.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
          value={sectionId}
        />
        <label htmlFor="section-content">Section Content</label>
        <textarea
          id="section-content"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setContent(event.target.value)}
          rows={5}
          style={{ width: "100%", marginBottom: 12 }}
          value={content}
        />
        <button className="button" onClick={handleGenerateRewrite} type="button">
          Rewrite Section
        </button>
        <button className="button secondary" onClick={handleGenerateSummary} type="button">
          Summarize Document
        </button>
      </div>

      <div className="panel">
        <h3>Collaborative Editor</h3>
        <CollaborativeEditor
          documentId={documentId}
          onEditorReady={setEditor}
          userId={userId}
          userName="Web User"
        />
      </div>

      <SuggestionPanel onApplyAction={handleApplyAction} suggestions={suggestions} />
    </main>
  );
}
