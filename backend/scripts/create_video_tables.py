# -*- coding: utf-8 -*-
"""
Script de Migração: Criação das tabelas videos e video_analytics
Data: 2026-09-10
"""
import sys
import os
from pathlib import Path

# Ajusta stdout/stderr para UTF-8 no Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

os.environ["PYTHONUTF8"] = "1"

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import engine, Base
from app.models.video import Video, VideoAnalytics

def run_migration():
    print("Iniciando migração de banco de dados...")
    print(f"Conectando via: {engine.url}")
    Base.metadata.create_all(bind=engine)
    print("Sucesso: Tabelas 'videos' e 'video_analytics' criadas/verificadas no PostgreSQL!")

if __name__ == "__main__":
    run_migration()
