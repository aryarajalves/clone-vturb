import os
import io
import re
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

    def build_public_url(self, unique_key: str) -> str:
        """
        Monta a URL pública acessível para um arquivo armazenado no Backblaze B2.
        Garante conformidade com o formato de Friendly URLs exigido pelo Backblaze B2
        ao entregar através de CDN/Cloudflare (/file/<bucket>/<arquivo>).
        """
        bucket = settings.BACKBLAZE_BUCKET_NAME.strip()
        if settings.BACKBLAZE_CDN_URL:
            base_url = settings.BACKBLAZE_CDN_URL.strip().rstrip("/")
            # Se for endpoint S3 oficial (s3.*.backblazeb2.com), a API S3 não utiliza o segmento /file/
            if re.match(r"https?://s3\.[^/]+\.backblazeb2\.com", base_url):
                base_url = re.sub(r"(https?://s3\.[^/]+\.backblazeb2\.com)/file", r"\1", base_url)
                if not base_url.endswith(f"/{bucket}"):
                    base_url = f"{base_url}/{bucket}"
            else:
                # É um domínio customizado ou CDN Cloudflare (ex: midia.aryaraj.shop)
                # O Backblaze B2 exige obrigatoriamente o prefixo /file/<bucket>/ para Friendly URLs
                if f"/file/{bucket}" in base_url:
                    pass
                elif base_url.endswith(f"/{bucket}"):
                    base_url = re.sub(rf"/{re.escape(bucket)}$", f"/file/{bucket}", base_url)
                else:
                    base_url = f"{base_url}/file/{bucket}"
            return f"{base_url}/{unique_key}"

        endpoint = settings.BACKBLAZE_ENDPOINT_URL.strip().rstrip("/")
        if not endpoint.startswith("http"):
            endpoint = f"https://{endpoint}"
        return f"{endpoint}/{bucket}/{unique_key}"

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

        # Lê os bytes para memória garantindo que o fallback local funcione mesmo se o S3 fechar o stream
        if hasattr(file_obj, "seek"):
            try:
                file_obj.seek(0)
            except Exception:
                pass

        file_bytes = file_obj.read() if hasattr(file_obj, "read") else b""

        if self.is_backblaze_configured():
            try:
                s3 = self.get_s3_client()
                logger.info(f"Iniciando upload para Backblaze B2: bucket={settings.BACKBLAZE_BUCKET_NAME}, key={unique_key}")

                extra_args = {"ContentType": content_type}
                stream = io.BytesIO(file_bytes)
                s3.upload_fileobj(
                    stream,
                    settings.BACKBLAZE_BUCKET_NAME,
                    unique_key,
                    ExtraArgs=extra_args
                )

                public_url = self.build_public_url(unique_key)
                logger.info(f"Upload concluído com sucesso no Backblaze B2: {public_url}")
                return public_url

            except Exception as exc:
                logger.error(f"Erro no upload para Backblaze B2: {exc}. Realizando fallback para armazenamento local.")

        # Fallback para armazenamento local
        destination = LOCAL_UPLOAD_DIR / unique_key
        with open(destination, "wb") as buffer:
            buffer.write(file_bytes)

        local_url = f"/static/uploads/{unique_key}"
        logger.info(f"Arquivo salvo com sucesso no storage local: {local_url}")
        return local_url


storage_service = StorageService()
