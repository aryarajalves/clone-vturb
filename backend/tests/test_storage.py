import io
from unittest.mock import patch, MagicMock
from app.services.storage import StorageService
from app.core.config import settings


def test_storage_service_fallback_to_local(tmp_path):
    # Garante que as configurações estejam vazias para testar o fallback
    with patch.object(settings, "BACKBLAZE_KEY_ID", ""), \
         patch.object(settings, "BACKBLAZE_APPLICATION_KEY", ""), \
         patch.object(settings, "BACKBLAZE_BUCKET_NAME", ""), \
         patch.object(settings, "BACKBLAZE_ENDPOINT_URL", ""):

        service = StorageService()
        assert not service.is_backblaze_configured()

        dummy_file = io.BytesIO(b"conteudo de teste de video")
        result_url = service.upload_file(
            file_obj=dummy_file,
            original_filename="teste_video.mp4",
            content_type="video/mp4"
        )

        assert result_url.startswith("/static/uploads/")
        assert result_url.endswith(".mp4")


def test_storage_service_upload_to_backblaze_with_cdn():
    mock_s3 = MagicMock()

    with patch.object(settings, "BACKBLAZE_KEY_ID", "key123"), \
         patch.object(settings, "BACKBLAZE_APPLICATION_KEY", "secret123"), \
         patch.object(settings, "BACKBLAZE_BUCKET_NAME", "meu-bucket-vturb"), \
         patch.object(settings, "BACKBLAZE_ENDPOINT_URL", "https://s3.us-east-005.backblazeb2.com"), \
         patch.object(settings, "BACKBLAZE_CDN_URL", "https://videos.meudominio.com"):

        service = StorageService()
        assert service.is_backblaze_configured()

        # Injeta o mock do cliente S3
        service._s3_client = mock_s3

        dummy_file = io.BytesIO(b"video mp4 bytes")
        result_url = service.upload_file(
            file_obj=dummy_file,
            original_filename="vsl_alta_conversao.mp4",
            content_type="video/mp4"
        )

        # Verifica se o método upload_fileobj do S3 foi chamado corretamente
        mock_s3.upload_fileobj.assert_called_once()
        args, kwargs = mock_s3.upload_fileobj.call_args
        assert args[1] == "meu-bucket-vturb"  # Bucket
        assert args[2].endswith(".mp4")        # Chave do arquivo
        assert kwargs["ExtraArgs"]["ContentType"] == "video/mp4"

        # Verifica a URL retornada com o domínio de CDN
        assert result_url.startswith("https://videos.meudominio.com/")
        assert result_url.endswith(".mp4")


def test_storage_service_upload_to_backblaze_direct_endpoint():
    mock_s3 = MagicMock()

    with patch.object(settings, "BACKBLAZE_KEY_ID", "key123"), \
         patch.object(settings, "BACKBLAZE_APPLICATION_KEY", "secret123"), \
         patch.object(settings, "BACKBLAZE_BUCKET_NAME", "meu-bucket-vturb"), \
         patch.object(settings, "BACKBLAZE_ENDPOINT_URL", "https://s3.us-east-005.backblazeb2.com"), \
         patch.object(settings, "BACKBLAZE_CDN_URL", ""):

        service = StorageService()
        assert service.is_backblaze_configured()

        service._s3_client = mock_s3

        dummy_file = io.BytesIO(b"thumbnail image bytes")
        result_url = service.upload_file(
            file_obj=dummy_file,
            original_filename="capa.jpg",
            content_type="image/jpeg"
        )

        mock_s3.upload_fileobj.assert_called_once()
        # Sem CDN, usa o endpoint direto: https://s3.us-east-005.backblazeb2.com/meu-bucket-vturb/...
        assert result_url.startswith("https://s3.us-east-005.backblazeb2.com/meu-bucket-vturb/")
        assert result_url.endswith(".jpg")


def test_storage_service_upload_sanitizes_b2_s3_file_segment():
    mock_s3 = MagicMock()

    # Simula configuração errônea com /file/ em endpoint S3 do Backblaze
    with patch.object(settings, "BACKBLAZE_KEY_ID", "key123"), \
         patch.object(settings, "BACKBLAZE_APPLICATION_KEY", "secret123"), \
         patch.object(settings, "BACKBLAZE_BUCKET_NAME", "zap-voice"), \
         patch.object(settings, "BACKBLAZE_ENDPOINT_URL", "https://s3.us-west-004.backblazeb2.com"), \
         patch.object(settings, "BACKBLAZE_CDN_URL", "https://s3.us-west-004.backblazeb2.com/file/zap-voice"):

        service = StorageService()
        assert service.is_backblaze_configured()

        service._s3_client = mock_s3

        dummy_file = io.BytesIO(b"conteudo video")
        result_url = service.upload_file(
            file_obj=dummy_file,
            original_filename="video_teste.mp4",
            content_type="video/mp4"
        )

        mock_s3.upload_fileobj.assert_called_once()
        # Garante que o segmento /file/ foi removido para não quebrar na API S3 do Backblaze
        assert result_url.startswith("https://s3.us-west-004.backblazeb2.com/zap-voice/")
        assert not result_url.startswith("https://s3.us-west-004.backblazeb2.com/file/")
        assert result_url.endswith(".mp4")

