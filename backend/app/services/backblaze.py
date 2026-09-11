import os
import shutil
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
import boto3
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger("projetovturb")

# Diretório local de fallback para armazenamento de backups
LOCAL_BACKUP_DIR = Path(__file__).resolve().parent.parent.parent / "backups"
LOCAL_BACKUP_DIR.mkdir(parents=True, exist_ok=True)

class BackblazeBackupService:
    def __init__(self):
        self._s3_client = None

    @property
    def bucket_name(self) -> str:
        return settings.BACKBLAZE_BUCKET_NAME.strip() or "vturb-backups"

    def is_configured(self) -> bool:
        """Verifica se as credenciais do Backblaze B2 estão configuradas."""
        return bool(
            settings.BACKBLAZE_KEY_ID
            and settings.BACKBLAZE_APPLICATION_KEY
            and settings.BACKBLAZE_BUCKET_NAME
            and settings.BACKBLAZE_ENDPOINT_URL
        )

    def get_s3_client(self):
        """Retorna cliente S3 configurado para o Backblaze B2."""
        if self._s3_client is None:
            endpoint = settings.BACKBLAZE_ENDPOINT_URL.strip()
            if not endpoint.startswith("http"):
                endpoint = f"https://{endpoint}"

            self._s3_client = boto3.client(
                "s3",
                endpoint_url=endpoint,
                aws_access_key_id=settings.BACKBLAZE_KEY_ID.strip(),
                aws_secret_access_key=settings.BACKBLAZE_APPLICATION_KEY.strip(),
                config=Config(
                    signature_version="s3v4",
                    s3={"addressing_style": "path"}
                ),
            )
        return self._s3_client

    def upload_backup_file(self, local_file_path: Path, s3_key: str) -> str:
        """
        Faz upload de um arquivo de dump para o Backblaze S3.
        Se não configurado, armazena no diretório local de backups.
        Retorna a chave ou caminho de armazenamento.
        """
        clean_key = s3_key.lstrip("/")

        if self.is_configured():
            try:
                s3 = self.get_s3_client()
                logger.info(f"Enviando dump '{local_file_path.name}' para Backblaze B2 bucket '{self.bucket_name}' key '{clean_key}'...")
                with open(local_file_path, "rb") as f:
                    s3.upload_fileobj(
                        f,
                        self.bucket_name,
                        clean_key,
                        ExtraArgs={"ContentType": "application/gzip"}
                    )
                logger.info(f"Dump enviado com sucesso para o Backblaze S3: {clean_key}")
                return clean_key
            except Exception as e:
                logger.error(f"Erro ao enviar dump para Backblaze B2: {e}. Usando armazenamento local seguro.")

        # Fallback local de desenvolvimento
        target_path = LOCAL_BACKUP_DIR / clean_key.split("/")[-1]
        if local_file_path != target_path:
            shutil.copy2(local_file_path, target_path)
        logger.info(f"Dump armazenado localmente em: {target_path}")
        return clean_key

    def download_backup_file(self, s3_key: str, destination_path: Path) -> Path:
        """
        Baixa o arquivo de dump do Backblaze S3 ou do diretório local.
        """
        clean_key = s3_key.lstrip("/")
        destination_path.parent.mkdir(parents=True, exist_ok=True)

        if self.is_configured():
            try:
                s3 = self.get_s3_client()
                logger.info(f"Baixando dump '{clean_key}' do Backblaze B2...")
                s3.download_file(self.bucket_name, clean_key, str(destination_path))
                return destination_path
            except Exception as e:
                logger.error(f"Erro ao baixar dump do Backblaze S3: {e}. Tentando cópia local.")

        local_file = LOCAL_BACKUP_DIR / clean_key.split("/")[-1]
        if local_file.exists():
            if local_file != destination_path:
                shutil.copy2(local_file, destination_path)
            return destination_path

        raise FileNotFoundError(f"Arquivo de backup '{clean_key}' não encontrado no armazenamento.")

    def delete_backup_file(self, s3_key: str) -> bool:
        """
        Exclui o arquivo de dump do Backblaze S3 e do armazenamento local.
        """
        clean_key = s3_key.lstrip("/")
        deleted = False

        if self.is_configured():
            try:
                s3 = self.get_s3_client()
                s3.delete_object(Bucket=self.bucket_name, Key=clean_key)
                deleted = True
                logger.info(f"Arquivo '{clean_key}' excluído do Backblaze B2.")
            except Exception as e:
                logger.warning(f"Erro ao deletar do Backblaze B2: {e}")

        local_file = LOCAL_BACKUP_DIR / clean_key.split("/")[-1]
        if local_file.exists():
            try:
                local_file.unlink()
                deleted = True
                logger.info(f"Arquivo local '{local_file.name}' excluído.")
            except Exception as e:
                logger.warning(f"Erro ao deletar arquivo local: {e}")

        return deleted

backblaze_backup_service = BackblazeBackupService()
