from fastapi import FastAPI
from fastapi.responses import JSONResponse

from api.routes import router
from core.config import settings
from core.logging import get_logger
from schemas.common import ApiError

logger = get_logger(__name__)
app = FastAPI(title=settings.app_name, version=settings.app_version)
app.include_router(router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "agent", "version": "v1"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception) -> JSONResponse:
    logger.exception("api.unhandled.error error=%s", exc)
    payload = ApiError(code="INTERNAL_ERROR", message="Unhandled server error")
    return JSONResponse(status_code=500, content=payload.model_dump(mode="json"))
