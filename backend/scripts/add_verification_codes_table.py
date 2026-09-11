# -*- coding: utf-8 -*-
"""
Script de Migração: Criação da tabela email_verification_codes
Data: 2026-09-11
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
from app.models.user import EmailVerificationCode

def run_migration():
    print("Iniciando criação da tabela email_verification_codes no banco de dados...")
    print(f"Conectando via: {engine.url}")

    Base.metadata.create_all(bind=engine, tables=[EmailVerificationCode.__table__])
    print("Tabela 'email_verification_codes' criada/verificada com sucesso no PostgreSQL!")

if __name__ == "__main__":
    run_migration()
