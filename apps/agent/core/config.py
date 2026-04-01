from urllib.parse import quote, urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "akshar-agent"
    app_version: str = "v1"
    llm_provider: str = "stub"
    redis_url: str | None = None
    upstash_redis_url: str | None = None
    upstash_redis_rest_url: str | None = None
    upstash_redis_rest_token: str | None = None

    @property
    def resolved_redis_url(self) -> str:
        if self.upstash_redis_url:
            return self.upstash_redis_url

        if self.upstash_redis_rest_url and self.upstash_redis_rest_token:
            host = urlparse(self.upstash_redis_rest_url).netloc
            token = quote(self.upstash_redis_rest_token, safe="")
            return f"rediss://default:{token}@{host}:6379/0"

        if self.redis_url:
            return self.redis_url

        return "redis://localhost:6379/0"


settings = Settings()
