from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "akshar-agent"
    app_version: str = "v1"
    llm_provider: str = "stub"
    redis_url: str = "redis://localhost:6379/0"


settings = Settings()
