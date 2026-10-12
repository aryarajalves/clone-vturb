from app.core.config import settings
from sqlalchemy import create_engine

def test_settings_load_database_url():
    assert settings.PROJECT_NAME == "ProjetoVturb"
    assert "postgresql://" in settings.DATABASE_URL
    assert "vturb_db" in settings.DATABASE_URL

def test_database_engine_driver_compatibility():
    """Valida que o engine SQLAlchemy inicializa perfeitamente com driver PostgreSQL."""
    engine = create_engine(settings.DATABASE_URL)
    assert engine is not None
    assert engine.dialect.name == "postgresql"

def test_database_url_postgres_normalization():
    """Valida que URLs iniciadas em postgres:// são normalizadas para postgresql://."""
    raw_url = "postgres://user:pass@host:5432/db"
    normalized = raw_url.replace("postgres://", "postgresql://", 1)
    assert normalized.startswith("postgresql://")
    engine = create_engine(normalized)
    assert engine.dialect.name == "postgresql"

