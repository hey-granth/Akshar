from uuid import uuid4
from collections.abc import Sequence

from schemas.agent import (
    AgentSuggestionResponse,
    DiffOperation,
    RewriteSectionRequest,
    SuggestionDiff,
    SummarizeDocumentRequest,
)
from services.context_service import ContextService


class DeterministicAgentPipeline:
    def __init__(self, context_service: ContextService) -> None:
        self.context_service = context_service

    def rewrite_section(self, request: RewriteSectionRequest) -> AgentSuggestionResponse:
        context = self.context_service.retrieve_relevant(request.sectionId, request.context)
        rewritten = self._rewrite_text(request.content, request.tone, context)
        suggestion = SuggestionDiff(
            suggestionId=str(uuid4()),
            documentId=request.documentId,
            baseSnapshotVersion=1,
            operations=[
                DiffOperation(
                    operation="replace",
                    targetBlockId=request.sectionId,
                    content=rewritten,
                    startOffset=0,
                    endOffset=len(request.content),
                )
            ],
            reason="rewrite_section_mvp",
        )
        return AgentSuggestionResponse(requestId=str(uuid4()), suggestion=suggestion)

    def summarize_document(self, request: SummarizeDocumentRequest) -> AgentSuggestionResponse:
        summary = self._summarize_sections(request.context)
        target_section = request.targetSectionIds[0]
        suggestion = SuggestionDiff(
            suggestionId=str(uuid4()),
            documentId=request.documentId,
            baseSnapshotVersion=1,
            operations=[
                DiffOperation(
                    operation="replace",
                    targetBlockId=target_section,
                    content=summary,
                    startOffset=0,
                    endOffset=10_000,
                )
            ],
            reason="summarize_document_mvp",
        )
        return AgentSuggestionResponse(requestId=str(uuid4()), suggestion=suggestion)

    def _rewrite_text(self, text: str, tone: str, context: Sequence[object]) -> str:
        normalized = " ".join(text.split())
        if tone == "concise":
            return normalized[: max(1, min(len(normalized), 200))]
        return f"{normalized} (edited with {len(context)} context blocks)"

    def _summarize_sections(self, context: Sequence[object]) -> str:
        if not context:
            return "Summary: no additional context provided."
        return f"Summary: synthesized {len(context)} contextual sections."
