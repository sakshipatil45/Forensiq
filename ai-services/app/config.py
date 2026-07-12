from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class AISettings(BaseSettings):
    # API Port
    PORT: int = 8001
    
    # LLM Settings
    LLM_PROVIDER: str = Field(default="ollama") # openai | gemini | ollama
    LLM_MODEL: str = Field(default="llama3")
    
    # Keys
    OPENAI_API_KEY: str = "mock_key"
    GEMINI_API_KEY: str = "mock_key"
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = AISettings()
