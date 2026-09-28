import sys
import os
from pathlib import Path

# Adiciona o diretório do backend ao sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from sqlalchemy import text
from app.core.database import engine, SessionLocal

logger = logging.getLogger("projetovturb")

def migrate():
    """
    Cria a tabela video_leads caso não exista.
    """
    logger.info("Iniciando migração para criação da tabela video_leads...")
    db = SessionLocal()
    try:
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS video_leads (
            id SERIAL PRIMARY KEY,
            video_id VARCHAR(36) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
            lead_id VARCHAR(100),
            name VARCHAR(255),
            phone VARCHAR(50),
            session_id VARCHAR(100),
            event VARCHAR(50) DEFAULT 'vsl_play',
            watch_time_seconds FLOAT DEFAULT 0.0,
            max_progress_percent FLOAT DEFAULT 0.0,
            reached_cta INTEGER DEFAULT 0,
            play_count INTEGER DEFAULT 1,
            first_play_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_video_leads_video_id ON video_leads(video_id);
        CREATE INDEX IF NOT EXISTS ix_video_leads_lead_id ON video_leads(lead_id);
        CREATE INDEX IF NOT EXISTS ix_video_leads_phone ON video_leads(phone);
        CREATE INDEX IF NOT EXISTS ix_video_leads_session_id ON video_leads(session_id);
        CREATE INDEX IF NOT EXISTS ix_video_leads_created_at ON video_leads(created_at);
        """
        # Se for SQLite em ambiente de teste local
        if "sqlite" in str(engine.url):
            sqlite_sql = """
            CREATE TABLE IF NOT EXISTS video_leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id VARCHAR(36) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
                lead_id VARCHAR(100),
                name VARCHAR(255),
                phone VARCHAR(50),
                session_id VARCHAR(100),
                event VARCHAR(50) DEFAULT 'vsl_play',
                watch_time_seconds FLOAT DEFAULT 0.0,
                max_progress_percent FLOAT DEFAULT 0.0,
                reached_cta INTEGER DEFAULT 0,
                play_count INTEGER DEFAULT 1,
                first_play_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS ix_video_leads_video_id ON video_leads(video_id);
            CREATE INDEX IF NOT EXISTS ix_video_leads_lead_id ON video_leads(lead_id);
            CREATE INDEX IF NOT EXISTS ix_video_leads_phone ON video_leads(phone);
            CREATE INDEX IF NOT EXISTS ix_video_leads_session_id ON video_leads(session_id);
            CREATE INDEX IF NOT EXISTS ix_video_leads_created_at ON video_leads(created_at);
            """
            for statement in sqlite_sql.split(";"):
                stmt = statement.strip()
                if stmt:
                    db.execute(text(stmt))
        else:
            db.execute(text(create_table_sql))

        db.commit()
        logger.info("Tabela video_leads criada/verificada com sucesso!")
        print("Migração da tabela video_leads concluída com sucesso.")
    except Exception as e:
        db.rollback()
        logger.error(f"Erro durante a migração da tabela video_leads: {e}")
        print(f"Erro na migração: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
