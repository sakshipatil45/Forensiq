from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Forensiq Platform"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    NODE_ENV: str = "development"
    APP_ENV: str = "development"

    # Databases
    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:supersecuredbpass123@postgres:5432/forensiq")
    REDIS_URL: str = Field(default="redis://redis:6379/0")

    # Security
    JWT_SECRET: str = Field(default="8f3db47f9c8f041b3e8ad6b71f98d023b092f6b8b0fae090f7a08b981f9640ab")
    INGEST_API_KEY: str = Field(default="forensiq_super_secure_ingest_key_123")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # AI Service Address
    AI_SERVICE_URL: str = Field(default="http://ai-services:8001")

    # Integrations (for worker logging / mocking validations)
    VIRUSTOTAL_API_KEY: str = "mock_vt_key"
    ABUSEIPDB_API_KEY: str = "mock_abuse_key"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
