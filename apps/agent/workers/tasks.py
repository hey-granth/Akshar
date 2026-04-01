from celery import Celery

from core.config import settings
from core.logging import get_logger
from schemas.agent import RewriteSectionRequest, SummarizeDocumentRequest
from services.agent_service import AgentService

logger = get_logger(__name__)
celery_app = Celery("akshar_agent", broker=settings.redis_url, backend=settings.redis_url)
agent_service = AgentService()


@celery_app.task(name="agent.rewrite_section")
def rewrite_section_task(payload: dict[str, object]) -> dict[str, object]:
    logger.info("worker.rewrite.input payload=%s", payload)
    request = RewriteSectionRequest.model_validate(payload)
    response = agent_service.rewrite_section(request)
    output = response.model_dump(mode="json")
    logger.info("worker.rewrite.output output=%s", output)
    return output


@celery_app.task(name="agent.summarize_document")
def summarize_document_task(payload: dict[str, object]) -> dict[str, object]:
    logger.info("worker.summarize.input payload=%s", payload)
    request = SummarizeDocumentRequest.model_validate(payload)
    response = agent_service.summarize_document(request)
    output = response.model_dump(mode="json")
    logger.info("worker.summarize.output output=%s", output)
    return output
