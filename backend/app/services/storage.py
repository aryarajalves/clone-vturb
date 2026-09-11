import os
import shutil
import uuid
import mimetypes
import logging
from pathlib import Path
from typing import Optional, BinaryIO
import boto3
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger("projetovturb")

# Diretório local padrão para fallback de desenvolvimento e testes
LOCAL_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads"
LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class StorageService:
    def __init__(self):
        self._s3_client = None

    def is_backblaze_configured(self) -> bool:
        """Verifica se todas as variáveis necessárias para o Backblaze B2 estão presentes."""
        return bool(
            settings.BACKBLAZE_KEY_ID
            and settings.BACKBLAZE_APPLICATION_KEY
            and settings.BACKBLAZE_BUCKET_NAME
            and settings.BACKBLAZE_ENDPOINT_URL
        )

    def get_s3_client(self):
        """Inicializa e retorna o cliente S3 configurado para o Backblaze B2."""
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

    def upload_file(
        self,
        file_obj: BinaryIO,
        original_filename: str,
        content_type: Optional[str] = None
    ) -> str:
        """
        Realiza o upload de um arquivo para o Backblaze B2 (se configurado)
        ou faz o fallback automático para o armazenamento local em static/uploads/.
        Retorna a URL pública acessível do arquivo.
        """
        ext = Path(original_filename).suffix.lower()
        unique_key = f"{uuid.uuid4()}{ext}"

        if not content_type:
            guessed_type, _ = mimetypes.guess_type(original_filename)
            content_type = guessed_type or "application/octet-stream"

        if self.is_backblaze_configured():
            try:
                s3 = self.get_s3_client()
                logger.info(f"Iniciando upload para Backblaze B2: bucket={settings.BACKBLAZE_BUCKET_NAME}, key={unique_key}")

                # Garante que o ponteiro do arquivo esteja no início
                if hasattr(file_obj, "seek"):
                    file_obj.seek(0)

                extra_args = {"ContentType": content_type}
                s3.upload_fileobj(
                    file_obj,
                    settings.BACKBLAZE_BUCKET_NAME,
                    unique_key,
                    ExtraArgs=extra_args
                )

                # Monta a URL pública (CDN customizada ou Endpoint B2)
                if settings.BACKBLAZE_CDN_URL:
                    base_url = settings.BACKBLAZE_CDN_URL.rstrip("/")
                    public_url = f"{base_url}/{unique_key}"
                else:
                    endpoint = settings.BACKBLAZE_ENDPOINT_URL.rstrip("/")
                    if not endpoint.startswith("http"):
                        endpoint = f"https://{endpoint}"
                    public_url = f"{endpoint}/{settings.BACKBLAZE_BUCKET_NAME}/{unique_key}"

                logger.info(f"Upload concluído com sucesso no Backblaze B2: {public_url}")
                return public_url

            except Exception as exc:
                logger.error(f"Erro no upload para Backblaze B2: {exc}. Realizando fallback para armazenamento local.")

        # Fallback para armazenamento local
        destination = LOCAL_UPLOAD_DIR / unique_key
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)

        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)

        local_url = f"/static/uploads/{unique_key}"
        logger.info(f"Arquivo salvo com sucesso no storage local: {local_url}")
        return local_url


storage_service = StorageService()
