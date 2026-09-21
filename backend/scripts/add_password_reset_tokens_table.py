# -*- coding: utf-8 -*-
"""
Script de Migração: Criação da tabela password_reset_tokens
Data: 2026-09-17
"""
import sys
import os
from pathlib import Path

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
from app.models.user import PasswordResetToken

def run_migration():
    print("Iniciando criação da tabela password_reset_tokens no banco de dados...")
    print(f"Conectando via: {engine.url}")

    Base.metadata.create_all(bind=engine, tables=[PasswordResetToken.__table__])
    print("Tabela 'password_reset_tokens' criada/verificada com sucesso no PostgreSQL!")

if __name__ == "__main__":
    run_migration()
