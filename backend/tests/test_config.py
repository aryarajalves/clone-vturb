from app.core.config import settings

def test_settings_load_database_url():
    assert settings.PROJECT_NAME == "ProjetoVturb"
    assert "postgresql://" in settings.DATABASE_URL
    assert "vturb_db" in settings.DATABASE_URL
