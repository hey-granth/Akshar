from fastapi import APIRouter, HTTPException

from core.logging import get_logger
from schemas.agent import AgentSuggestionResponse, RewriteSectionRequest, SummarizeDocumentRequest
from services.agent_service import AgentService
from workers.tasks import rewrite_section_task, summarize_document_task

logger = get_logger(__name__)
router = APIRouter()
service = AgentService()


@router.post("/rewrite-section", response_model=AgentSuggestionResponse)
async def rewrite_section(request: RewriteSectionRequest) -> AgentSuggestionResponse:
    try:
        logger.info("api.rewrite.input request=%s", request.model_dump(mode="json"))
        return service.rewrite_section(request)
    except Exception as error:  # noqa: BLE001
        logger.exception("api.rewrite.error error=%s", error)
        raise HTTPException(status_code=500, detail="rewrite_section_failed") from error


@router.post("/summarize-document", response_model=AgentSuggestionResponse)
async def summarize_document(request: SummarizeDocumentRequest) -> AgentSuggestionResponse:
    try:
        logger.info("api.summarize.input request=%s", request.model_dump(mode="json"))
        return service.summarize_document(request)
    except Exception as error:  # noqa: BLE001
        logger.exception("api.summarize.error error=%s", error)
        raise HTTPException(status_code=500, detail="summarize_document_failed") from error


@router.post("/jobs/rewrite-section")
async def enqueue_rewrite(request: RewriteSectionRequest) -> dict[str, str]:
    payload = request.model_dump(mode="json")
    logger.info("api.jobs.rewrite.input payload=%s", payload)
    task = rewrite_section_task.delay(payload)
    return {"version": "v1", "taskId": task.id}


@router.post("/jobs/summarize-document")
async def enqueue_summary(request: SummarizeDocumentRequest) -> dict[str, str]:
    payload = request.model_dump(mode="json")
    logger.info("api.jobs.summarize.input payload=%s", payload)
    task = summarize_document_task.delay(payload)
    return {"version": "v1", "taskId": task.id}
