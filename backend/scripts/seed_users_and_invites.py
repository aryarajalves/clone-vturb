# -*- coding: utf-8 -*-
"""
Automação de Testes: População de Dados em Lote (Seed)
Objetivo: Criar pelo menos 100 usuários e 100 convites no banco de dados
para validar a seleção global e paginação no sistema.
"""
import sys
import os
import secrets
from pathlib import Path
from datetime import datetime, timedelta, timezone

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

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserInvite
from app.core.security import pwd_hasher

def seed_users_and_invites(target_count: int = 100):
    print("=" * 60)
    print(f"🚀 Iniciando Automação de Carga de Dados (Mínimo {target_count} itens)")
    print(f"📡 Conectando ao Banco: {engine.url}")
    print("=" * 60)

    # Garante que as tabelas existem
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. População de Usuários
        existing_users_count = db.query(User).filter(User.is_super_admin == False).count()
        print(f"📊 Usuários comuns existentes no banco: {existing_users_count}")

        users_to_create = max(target_count, target_count - existing_users_count)
        if existing_users_count >= target_count:
            print(f"✅ O banco já possui {existing_users_count} usuários. Adicionando mais {target_count} usuários para testes extensivos...")
            users_to_create = target_count

        print(f"⏳ Gerando hash de senha para {users_to_create} novos usuários...")
        # Gera o hash uma única vez para máxima performance
        default_hash = pwd_hasher.hash("SenhaTeste123456!")

        nomes_exemplo = [
            "Lucas Silva", "Beatriz Oliveira", "Gabriel Santos", "Mariana Souza",
            "Rodrigo Lima", "Fernanda Pereira", "Thiago Costa", "Camila Ferreira",
            "Rafael Carvalho", "Juliana Ribeiro", "Matheus Almeida", "Larissa Nascimento",
            "Bruno Mendes", "Aline Barbosa", "Felipe Martins", "Carolina Ramos",
            "Leonardo Rocha", "Amanda Castro", "Diego Fernandes", "Bruna Dias"
        ]

        new_users = []
        now = datetime.now(timezone.utc)

        start_index = existing_users_count + 1
        for i in range(start_index, start_index + users_to_create):
            nome_base = nomes_exemplo[(i - 1) % len(nomes_exemplo)]
            role = "admin" if (i % 5 == 0) else "user"
            email = f"usuario_{i:03d}@teste.com"

            # Se já existir um com esse email, gera com timestamp
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                email = f"usuario_{i:03d}_{int(now.timestamp())}@teste.com"

            user = User(
                email=email,
                name=f"{nome_base} #{i:03d}",
                password_hash=default_hash,
                role=role,
                is_super_admin=False,
                created_at=now - timedelta(days=(i % 30), hours=(i % 24), minutes=(i % 60)),
                updated_at=now - timedelta(days=(i % 30)),
            )
            new_users.append(user)

        db.add_all(new_users)
        db.commit()
        total_users = db.query(User).count()
        print(f"✅ {len(new_users)} novos usuários criados com sucesso! Total no banco: {total_users}")

        # 2. População de Convites
        existing_invites_count = db.query(UserInvite).count()
        print(f"\n📊 Convites existentes no banco: {existing_invites_count}")

        invites_to_create = max(target_count, target_count - existing_invites_count)
        if existing_invites_count >= target_count:
            print(f"✅ O banco já possui {existing_invites_count} convites. Adicionando mais {target_count} convites para testes extensivos...")
            invites_to_create = target_count

        print(f"⏳ Gerando {invites_to_create} convites com status e datas variadas...")
        new_invites = []
        for j in range(1, invites_to_create + 1):
            token = secrets.token_urlsafe(32)
            role = "admin" if (j % 4 == 0) else "user"

            # Variedade: alguns expirados, alguns usados, maioria disponível
            if j % 7 == 0:
                # Expirado
                expires_at = now - timedelta(hours=(j % 48 + 1))
                is_used = False
                used_by_email = None
            elif j % 5 == 0:
                # Utilizado
                expires_at = now + timedelta(days=2)
                is_used = True
                used_by_email = f"cliente_usou_{j}@exemplo.com"
            else:
                # Disponível
                horas_validade = (24 if j % 2 == 0 else 48) if j % 3 != 0 else 168
                expires_at = now + timedelta(hours=horas_validade)
                is_used = False
                used_by_email = None

            invite = UserInvite(
                token=token,
                role=role,
                expires_at=expires_at,
                is_used=is_used,
                used_by_email=used_by_email,
                created_at=now - timedelta(days=(j % 15), hours=(j % 12)),
            )
            new_invites.append(invite)

        db.add_all(new_invites)
        db.commit()
        total_invites = db.query(UserInvite).count()
        print(f"✅ {len(new_invites)} novos convites criados com sucesso! Total no banco: {total_invites}")

        print("\n" + "=" * 60)
        print("🎉 Automação concluída com êxito!")
        print(f"👥 Total de Usuários no Banco: {total_users}")
        print(f"✉️ Total de Convites no Banco: {total_invites}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao popular dados: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_users_and_invites(100)
