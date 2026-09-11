# -*- coding: utf-8 -*-
"""
Script de Migração: Adição da coluna 'name' na tabela users
Data: 2026-09-11
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

from sqlalchemy import text
from app.core.database import engine

def run_migration():
    print("Iniciando migração de banco de dados para adicionar 'name' aos usuários...")
    print(f"Conectando via: {engine.url}")

    with engine.connect() as conn:
        # 1. Adicionar coluna 'name' na tabela 'users' se não existir
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL;
        """))
        conn.commit()
        print("Coluna 'name' adicionada/verificada com sucesso na tabela 'users'.")

if __name__ == "__main__":
    run_migration()
