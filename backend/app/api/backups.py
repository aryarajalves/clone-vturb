import os
import tempfile
import logging
from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.backup import BackupRecord, BackupSchedule
from app.schemas.backup import (
    BackupRecordResponse,
    BackupScheduleResponse,
    UpdateScheduleRequest,
    BackupMetricsResponse,
    BulkDeleteBackupsRequest,
    BulkDeleteBackupsResponse,
)
from app.services.backup_manager import BackupManager
from app.services.backblaze import backblaze_backup_service
from app.api.users import require_super_admin

logger = logging.getLogger("projetovturb")

router = APIRouter()

@router.get("/", response_model=List[BackupRecordResponse])
def list_backups(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Lista todos os backups registrados no sistema, ordenados pelo mais recente."""
    return db.query(BackupRecord).order_by(BackupRecord.created_at.desc()).all()

@router.get("/metrics", response_model=BackupMetricsResponse)
def get_backup_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Retorna dados consolidados para os cards de métricas do topo do painel."""
    last_backup = db.query(BackupRecord).order_by(BackupRecord.created_at.desc()).first()
    total_count = db.query(BackupRecord).count()

    schedule = db.query(BackupSchedule).first()
    retention = schedule.retention_limit if schedule else 30
    next_at = schedule.next_backup_at if schedule else None

    freq_text = "A cada 6 hora(s)"
    if schedule:
        unit = "hora(s)" if schedule.frequency == "hours" else "dia(s)" if schedule.frequency == "days" else "semana(s)"
        freq_text = f"A cada {schedule.interval_value} {unit}"

    return BackupMetricsResponse(
        last_backup_filename=last_backup.filename if last_backup else None,
        last_backup_at=last_backup.created_at if last_backup else None,
        next_backup_at=next_at,
        frequency_text=freq_text,
        retention_limit=retention,
        total_backups=total_count,
    )

@router.post("/create", response_model=BackupRecordResponse)
def create_manual_backup(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Gera um snapshot manual imediato do banco PostgreSQL e envia para o Backblaze B2."""
    try:
        record = BackupManager.create_database_dump(db)
        logger.info(f"Backup manual criado com sucesso: {record.filename}")
        return record
    except Exception as e:
        logger.error(f"Falha ao criar backup manual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar backup: {str(e)}"
        )

@router.get("/schedule", response_model=BackupScheduleResponse)
def get_backup_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Retorna as configurações atuais da rotina de agendamento automático."""
    schedule = db.query(BackupSchedule).first()
    if not schedule:
        schedule = BackupSchedule(
            id=1,
            is_active=True,
            frequency="hours",
            interval_value=6,
            s3_folder="vturb/backups/",
            retention_limit=30,
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
    return schedule

@router.put("/schedule", response_model=BackupScheduleResponse)
def update_backup_schedule(
    payload: UpdateScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Atualiza as configurações da rotina de agendamento automático."""
    schedule = db.query(BackupSchedule).first()
    if not schedule:
        schedule = BackupSchedule(id=1)
        db.add(schedule)

    schedule.is_active = payload.is_active
    schedule.frequency = payload.frequency
    schedule.interval_value = payload.interval_value
    schedule.s3_folder = payload.s3_folder.strip()
    schedule.retention_limit = payload.retention_limit

    db.commit()
    db.refresh(schedule)
    logger.info("Configuração de agendamento de backup atualizada com sucesso.")
    return schedule

@router.get("/{backup_id}/download")
def download_backup(
    backup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Baixa o arquivo compactado de dump (.dump.gz)."""
    record = db.query(BackupRecord).filter(BackupRecord.id == backup_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Backup não encontrado.")

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".dump.gz")
    temp_path = Path(temp_file.name)
    temp_file.close()

    try:
        backblaze_backup_service.download_backup_file(record.storage_path, temp_path)
        return FileResponse(
            path=str(temp_path),
            filename=record.filename,
            media_type="application/gzip",
        )
    except Exception as e:
        logger.error(f"Erro no download do backup {backup_id}: {e}")
        raise HTTPException(status_code=500, detail="Falha ao obter arquivo para download.")

@router.post("/{backup_id}/restore")
def restore_backup(
    backup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Restaura o banco de dados a partir do dump selecionado."""
    record = db.query(BackupRecord).filter(BackupRecord.id == backup_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Backup não encontrado.")

    try:
        BackupManager.restore_database_dump(db, backup_id)
        return {"detail": f"Banco de dados restaurado com sucesso a partir de {record.filename}."}
    except Exception as e:
        logger.error(f"Falha na restauração do backup {backup_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na restauração: {str(e)}")

@router.delete("/{backup_id}")
def delete_backup(
    backup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Exclui um backup do Backblaze S3 e remove o registro do banco."""
    record = db.query(BackupRecord).filter(BackupRecord.id == backup_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Backup não encontrado.")

    try:
        backblaze_backup_service.delete_backup_file(record.storage_path)
    except Exception as e:
        logger.warning(f"Erro ao remover arquivo físico do S3: {e}")

    db.delete(record)
    db.commit()
    return {"detail": "Backup excluído com sucesso."}

@router.post("/bulk-delete", response_model=BulkDeleteBackupsResponse)
def bulk_delete_backups(
    payload: BulkDeleteBackupsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Exclui múltiplos backups em lote do Backblaze S3 e do banco."""
    if not payload.ids:
        return BulkDeleteBackupsResponse(deleted_count=0, deleted_ids=[])

    records = db.query(BackupRecord).filter(BackupRecord.id.in_(payload.ids)).all()
    deleted_ids = []

    for r in records:
        try:
            backblaze_backup_service.delete_backup_file(r.storage_path)
        except Exception as e:
            logger.warning(f"Erro ao excluir arquivo físico de backup: {e}")
        deleted_ids.append(r.id)
        db.delete(r)

    db.commit()
    logger.info(f"{len(deleted_ids)} backups excluídos em lote.")
    return BulkDeleteBackupsResponse(deleted_count=len(deleted_ids), deleted_ids=deleted_ids)

@router.post("/upload", response_model=BackupRecordResponse)
async def upload_external_backup(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Recebe um arquivo de dump externo (.dump, .dump.gz, .sql) e envia para o Backblaze S3."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo inválido.")

    ext = Path(file.filename).suffix.lower()
    if ext not in [".gz", ".dump", ".sql"]:
        raise HTTPException(status_code=400, detail="Formato não suportado. Envie arquivos .dump, .dump.gz ou .sql.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")

    try:
        record = BackupManager.import_external_dump(db, file.filename, content)
        return record
    except Exception as e:
        logger.error(f"Erro ao processar upload externo de backup: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao importar backup: {str(e)}")
