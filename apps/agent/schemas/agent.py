from pydantic import BaseModel, ConfigDict, Field


class AgentContextBlock(BaseModel):
    model_config = ConfigDict(extra="forbid")

    blockId: str
    content: str
    score: float | None = Field(default=None, ge=0, le=1)


class RewriteSectionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = "v1"
    documentId: str
    sectionId: str
    content: str
    context: list[AgentContextBlock]
    tone: str = "neutral"


class SummarizeDocumentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = "v1"
    documentId: str
    targetSectionIds: list[str]
    context: list[AgentContextBlock]


class DiffOperation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    operation: str
    targetBlockId: str
    content: str | None = None
    startOffset: int | None = None
    endOffset: int | None = None


class SuggestionDiff(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = "v1"
    suggestionId: str
    documentId: str
    baseSnapshotVersion: int
    operations: list[DiffOperation]
    reason: str


class AgentSuggestionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = "v1"
    requestId: str
    suggestion: SuggestionDiff
