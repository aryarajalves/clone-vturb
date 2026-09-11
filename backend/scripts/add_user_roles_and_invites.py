# -*- coding: utf-8 -*-
"""
Script de Migração: Adição de role na tabela users e criação da tabela user_invites
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
from app.core.database import engine, Base
from app.models.user import User, UserInvite

def run_migration():
    print("Iniciando migração de banco de dados para gestão de usuários e convites...")
    print(f"Conectando via: {engine.url}")

    with engine.connect() as conn:
        # 1. Adicionar coluna 'role' na tabela 'users' se não existir
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' NOT NULL;
        """))
        # Atualiza super administradores para role 'super_admin'
        conn.execute(text("""
            UPDATE users 
            SET role = 'super_admin' 
            WHERE is_super_admin = TRUE;
        """))
        conn.commit()
        print("Coluna 'role' verificada e atualizada na tabela 'users'.")

    # 2. Criar a tabela 'user_invites' se não existir
    Base.metadata.create_all(bind=engine, tables=[UserInvite.__table__])
    print("Tabela 'user_invites' criada/verificada com sucesso no PostgreSQL!")

if __name__ == "__main__":
    run_migration()
