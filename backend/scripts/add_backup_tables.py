# -*- coding: utf-8 -*-
"""
Script de Migração: Criação das tabelas backup_records e backup_schedules
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

from app.core.database import engine, Base, SessionLocal
from app.models.backup import BackupRecord, BackupSchedule

def run_migration():
    print("Iniciando criação das tabelas de backup no banco de dados...")
    print(f"Conectando via: {engine.url}")

    Base.metadata.create_all(bind=engine, tables=[BackupRecord.__table__, BackupSchedule.__table__])
    print("Tabelas 'backup_records' e 'backup_schedules' criadas/verificadas com sucesso no PostgreSQL!")

    # Inicializa registro de agendamento se não existir
    db = SessionLocal()
    try:
        schedule = db.query(BackupSchedule).first()
        if not schedule:
            default_schedule = BackupSchedule(
                id=1,
                is_active=True,
                frequency="hours",
                interval_value=6,
                s3_folder="vturb/backups/",
                retention_limit=30,
            )
            db.add(default_schedule)
            db.commit()
            print("Configuração inicial de agendamento automático criada com sucesso (Intervalo: 6h, Retenção: 30)!")
        else:
            print("Configuração de agendamento já existente.")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
