# -*- coding: utf-8 -*-
"""
Script de Migração/Correção: Normalização de URLs do Backblaze B2 S3
Data: 2026-09-15
Remove o segmento incorreto '/file/' nas URLs de endpoint S3 (s3.*.backblazeb2.com).
"""
import sys
import os
import re
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

from app.core.database import SessionLocal
from app.models.video import Video

def normalize_b2_url(url: str | None) -> str | None:
    if not url:
        return url
    return re.sub(r"(https?://s3\.[^/]+\.backblazeb2\.com)/file/", r"\1/", url)

def run_migration():
    print("Iniciando verificação e correção de URLs do Backblaze B2 na tabela 'videos'...")
    db = SessionLocal()
    try:
        videos = db.query(Video).all()
        updated_count = 0

        for video in videos:
            changed = False
            new_video_url = normalize_b2_url(video.video_url)
            if new_video_url != video.video_url:
                print(f"Vídeo [{video.id}]: atualizando video_url:")
                print(f"  Antes:  {video.video_url}")
                print(f"  Depois: {new_video_url}")
                video.video_url = new_video_url
                changed = True

            new_thumb_url = normalize_b2_url(video.thumbnail_url)
            if new_thumb_url != video.thumbnail_url:
                print(f"Vídeo [{video.id}]: atualizando thumbnail_url:")
                print(f"  Antes:  {video.thumbnail_url}")
                print(f"  Depois: {new_thumb_url}")
                video.thumbnail_url = new_thumb_url
                changed = True

            if hasattr(video, "smart_autoplay_url") and video.smart_autoplay_url:
                new_auto_url = normalize_b2_url(video.smart_autoplay_url)
                if new_auto_url != video.smart_autoplay_url:
                    video.smart_autoplay_url = new_auto_url
                    changed = True

            if changed:
                updated_count += 1

        if updated_count > 0:
            db.commit()
            print(f"Sucesso! {updated_count} registro(s) de vídeo atualizado(s) no banco de dados.")
        else:
            print("Nenhuma URL precisou de correção. Todas já estão normalizadas.")

    except Exception as exc:
        db.rollback()
        print(f"Erro durante a correção de URLs: {exc}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
