import os
from pathlib import Path
from dotenv import load_dotenv

# Carrega .env a partir da pasta backend/
backend_dir = Path(__file__).resolve().parent.parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "ProjetoVturb"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://vturb_user:vturb_password@localhost:5434/vturb_db"
    )

    # Configurações do Backblaze B2 Storage
    BACKBLAZE_KEY_ID: str = os.getenv("BACKBLAZE_KEY_ID", "")
    BACKBLAZE_APPLICATION_KEY: str = os.getenv("BACKBLAZE_APPLICATION_KEY", "")
    BACKBLAZE_BUCKET_NAME: str = os.getenv("BACKBLAZE_BUCKET_NAME", "")
    BACKBLAZE_ENDPOINT_URL: str = os.getenv("BACKBLAZE_ENDPOINT_URL", "")
    BACKBLAZE_CDN_URL: str = os.getenv("BACKBLAZE_CDN_URL", "")

settings = Settings()
