from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    DATABASE_URL: str
    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = ""
    VOYAGE_API_KEY: str = ""
    TURBOPUFFER_API_KEY: str = ""
    EMBEDDING_MODEL: str = "voyage-4-lite"
    EMBEDDING_DIM: int = 512
    LOGFIRE_TOKEN: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: str = "clawdvault-documents"
    MISTRAL_API_KEY: str = ""
    PDF_BACKEND: str = "pdf_oxide"  # "pdf_oxide" or "mistral"
    STAGE: str = "dev"
    APP_URL: str = "http://localhost:3000"
    API_URL: str = "http://localhost:8000"

    QUOTA_MAX_PAGES: int = 500  # per-user page limit (free tier)
    QUOTA_MAX_PAGES_PER_DOC: int = 300  # max pages per single document
    QUOTA_MAX_STORAGE_BYTES: int = 1_073_741_824  # 1 GB per user

    CONVERTER_URL: str = ""
    CONVERTER_SECRET: str = ""

    GLOBAL_OCR_ENABLED: bool = True
    GLOBAL_MAX_PAGES: int = 50_000
    GLOBAL_MAX_USERS: int = 200

    SENTRY_DSN: str = ""

    # Solana data services — power /api/v1/research/* live data
    HELIUS_API_KEY: str = ""
    HELIUS_RPC_URL: str = ""  # full URL including ?api-key=… ; falls back to mainnet+key
    HELIUS_WSS_URL: str = ""
    BIRDEYE_API_KEY: str = ""
    SOLANA_TRACKER_API_KEY: str = ""

    # Research autoloop scheduler
    RESEARCH_AUTOLOOP_ENABLED: bool = False
    RESEARCH_AUTOLOOP_INTERVAL_SECONDS: int = 1800  # 30 min, mirrors pump-scanner-cron
    RESEARCH_AUTOLOOP_MAX_CONCURRENT: int = 3


settings = Settings()
