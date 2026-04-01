from agents.pipeline import DeterministicAgentPipeline
from core.logging import get_logger
from schemas.agent import AgentSuggestionResponse, RewriteSectionRequest, SummarizeDocumentRequest
from services.context_service import ContextService

logger = get_logger(__name__)


class AgentService:
    def __init__(self) -> None:
        self.pipeline = DeterministicAgentPipeline(context_service=ContextService())

    def rewrite_section(self, request: RewriteSectionRequest) -> AgentSuggestionResponse:
        logger.info("agent.rewrite.input request=%s", request.model_dump(mode="json"))
        response = self.pipeline.rewrite_section(request)
        logger.info("agent.rewrite.output response=%s", response.model_dump(mode="json"))
        return response

    def summarize_document(self, request: SummarizeDocumentRequest) -> AgentSuggestionResponse:
        logger.info("agent.summarize.input request=%s", request.model_dump(mode="json"))
        response = self.pipeline.summarize_document(request)
        logger.info("agent.summarize.output response=%s", response.model_dump(mode="json"))
        return response
