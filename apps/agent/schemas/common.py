from pydantic import BaseModel, ConfigDict, Field


class ApiError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = Field(default="v1")
    code: str
    message: str
    details: dict[str, object] | None = None
