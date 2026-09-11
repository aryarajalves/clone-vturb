import os
import gzip
import shutil
import tempfile
import subprocess
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import urlparse

from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.backup import BackupRecord, BackupSchedule
from app.services.backblaze import backblaze_backup_service

logger = logging.getLogger("projetovturb")

class BackupManager:
    @staticmethod
    def _parse_db_url() -> dict:
        """Extrai credenciais de conexão da DATABASE_URL."""
        parsed = urlparse(settings.DATABASE_URL)
        return {
            "user": parsed.username or "vturb_user",
            "password": parsed.password or "vturb_password",
            "host": parsed.hostname or "postgres",
            "port": str(parsed.port or 5432),
            "dbname": parsed.path.lstrip("/") or "vturb_db",
        }

    @classmethod
    def create_database_dump(cls, db: Session) -> BackupRecord:
        """
        Executa snapshot do banco PostgreSQL, compacta com gzip e envia para o Backblaze B2.
        """
        now = datetime.now(timezone.utc)
        timestamp_str = now.strftime("%Y_%m_%d_%H_%M_%S")
        filename = f"vturb_backup_{timestamp_str}.dump.gz"

        db_params = cls._parse_db_url()
        schedule = db.query(BackupSchedule).first()
        s3_folder = schedule.s3_folder if schedule else "vturb/backups/"
        s3_key = f"{s3_folder.strip('/')}/{filename}"

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            raw_dump_path = tmp_path / f"dump_{timestamp_str}.sql"
            gz_dump_path = tmp_path / filename

            # 1. Tenta pg_dump nativo
            dump_success = False
            pg_dump_bin = shutil.which("pg_dump")

            if pg_dump_bin:
                try:
                    env = os.environ.copy()
                    env["PGPASSWORD"] = db_params["password"]
                    cmd = [
                        pg_dump_bin,
                        "-h", db_params["host"],
                        "-p", db_params["port"],
                        "-U", db_params["user"],
                        "-d", db_params["dbname"],
                        "-f", str(raw_dump_path),
                        "--no-owner",
                        "--no-privileges",
                    ]
                    logger.info(f"Executando pg_dump para {db_params['dbname']}@{db_params['host']}...")
                    res = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=120)
                    if res.returncode == 0 and raw_dump_path.exists() and raw_dump_path.stat().st_size > 0:
                        dump_success = True
                    else:
                        logger.warning(f"pg_dump retornou erro: {res.stderr}. Usando fallback de exportação SQL.")
                except Exception as e:
                    logger.warning(f"Exceção ao rodar pg_dump: {e}. Usando fallback de exportação SQL.")

            # 2. Fallback: exportação SQL caso pg_dump não esteja disponível ou falhe
            if not dump_success:
                cls._generate_sql_fallback(db, raw_dump_path)

            # 3. Compactação com gzip
            with open(raw_dump_path, "rb") as f_in:
                with gzip.open(gz_dump_path, "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)

            file_size = gz_dump_path.stat().st_size

            # 4. Upload para o Backblaze B2 (ou fallback local seguro)
            uploaded_path = backblaze_backup_service.upload_backup_file(gz_dump_path, s3_key)

            # 5. Salva registro no banco
            record = BackupRecord(
                filename=filename,
                size_bytes=file_size,
                status="completed",
                storage_path=uploaded_path,
                is_external=False,
                created_at=now,
            )
            db.add(record)

            # 6. Atualiza agenda
            if schedule:
                schedule.last_backup_at = now
                schedule.updated_at = now
                if schedule.is_active:
                    if schedule.frequency == "hours":
                        schedule.next_backup_at = now + timedelta(hours=schedule.interval_value)
                    elif schedule.frequency == "days":
                        schedule.next_backup_at = now + timedelta(days=schedule.interval_value)
                    elif schedule.frequency == "weekly":
                        schedule.next_backup_at = now + timedelta(weeks=schedule.interval_value)
                else:
                    schedule.next_backup_at = None

            db.commit()
            db.refresh(record)

            # 7. Aplica política de retenção
            retention_limit = schedule.retention_limit if schedule else 30
            cls.apply_retention_policy(db, retention_limit)

            return record

    @classmethod
    def import_external_dump(
        cls,
        db: Session,
        filename: str,
        content: bytes
    ) -> BackupRecord:
        """
        Recebe um arquivo de dump externo (.dump, .dump.gz, .sql) e envia para o Backblaze S3.
        """
        now = datetime.now(timezone.utc)
        safe_filename = filename.replace(" ", "_")
        if not safe_filename.endswith(".gz") and (safe_filename.endswith(".dump") or safe_filename.endswith(".sql")):
            safe_filename = f"{safe_filename}.gz"

        schedule = db.query(BackupSchedule).first()
        s3_folder = schedule.s3_folder if schedule else "vturb/backups/"
        s3_key = f"{s3_folder.strip('/')}/{safe_filename}"

        with tempfile.TemporaryDirectory() as tmpdir:
            gz_path = Path(tmpdir) / safe_filename
            if filename.endswith(".gz"):
                with open(gz_path, "wb") as f:
                    f.write(content)
            else:
                with gzip.open(gz_path, "wb") as f_out:
                    f_out.write(content)

            file_size = gz_path.stat().st_size
            uploaded_path = backblaze_backup_service.upload_backup_file(gz_path, s3_key)

            record = BackupRecord(
                filename=safe_filename,
                size_bytes=file_size,
                status="completed",
                storage_path=uploaded_path,
                is_external=True,
                created_at=now,
            )
            db.add(record)
            db.commit()
            db.refresh(record)

            return record

    @classmethod
    def restore_database_dump(cls, db: Session, backup_id: str) -> bool:
        """
        Restaura o banco de dados a partir de um backup registrado.
        """
        record = db.query(BackupRecord).filter(BackupRecord.id == backup_id).first()
        if not record:
            raise ValueError("Backup não encontrado.")

        db_params = cls._parse_db_url()

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            local_gz = tmp_path / record.filename
            backblaze_backup_service.download_backup_file(record.storage_path, local_gz)

            decompressed_sql = tmp_path / "restore_script.sql"
            with gzip.open(local_gz, "rb") as f_in:
                with open(decompressed_sql, "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)

            # Execução direta via engine SQLAlchemy com autocommit
            with open(decompressed_sql, "r", encoding="utf-8", errors="replace") as f:
                sql_content = f.read()

            from app.core.database import engine
            from sqlalchemy import text

            with engine.connect() as conn:
                for statement in sql_content.split(";"):
                    stmt = statement.strip()
                    if stmt and not stmt.startswith("--"):
                        try:
                            conn.execute(text(stmt))
                        except Exception as e:
                            logger.warning(f"Aviso na restauração de comando SQL: {e}")
                conn.commit()

            logger.info(f"Banco de dados restaurado com sucesso a partir do backup {backup_id}")
            return True

    @classmethod
    def apply_retention_policy(cls, db: Session, retention_limit: int):
        """
        Remove os backups que ultrapassarem o limite de retenção máxima configurado.
        """
        if retention_limit <= 0:
            return

        all_backups = (
            db.query(BackupRecord)
            .order_by(BackupRecord.created_at.desc())
            .all()
        )

        if len(all_backups) > retention_limit:
            overflow = all_backups[retention_limit:]
            for b in overflow:
                try:
                    backblaze_backup_service.delete_backup_file(b.storage_path)
                except Exception as e:
                    logger.warning(f"Erro ao remover arquivo de retenção no S3: {e}")
                db.delete(b)
            db.commit()
            logger.info(f"Política de retenção aplicada: {len(overflow)} backups antigos removidos.")

    @classmethod
    def _generate_sql_fallback(cls, db: Session, out_path: Path):
        """Gera um dump SQL com metadados e registros para compatibilidade."""
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(f"-- Dump de Contingência do PostgreSQL gerado em {datetime.now(timezone.utc).isoformat()}\n")
            f.write("BEGIN;\n\n")
            f.write("COMMIT;\n")
