from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-4o"
    openai_timeout: int = 60

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_storage_bucket: str = "clinote-documents"

    # Agent
    max_agent_steps: int = 25

    # App
    app_env: str = "development"
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache
def get_settings() -> Settings:
    return Settings()
