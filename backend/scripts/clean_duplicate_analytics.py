"""
Script para identificação e remoção de eventos duplicados (em milissegundos) na tabela video_analytics.
Remove disparos duplos causados por concorrência de ciclo de vida ou duplo envio acidental,
preservando o evento original.
"""

import sys
from pathlib import Path
from datetime import timedelta

# Adiciona o diretório do backend ao sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.models.video import VideoAnalytics, Video

def clean_duplicate_events():
    db = SessionLocal()
    try:
        print("Iniciando varredura de eventos duplicados na tabela video_analytics...")
        
        # Busca todos os eventos ordenados por vídeo, sessão, tipo de evento e data de criação
        all_events = (
            db.query(VideoAnalytics)
            .filter(VideoAnalytics.session_id.isnot(None))
            .order_by(
                VideoAnalytics.video_id,
                VideoAnalytics.session_id,
                VideoAnalytics.event_type,
                VideoAnalytics.created_at
            )
            .all()
        )
        
        print(f"Total de eventos analisados: {len(all_events)}")
        
        duplicates_to_delete = []
        
        for i in range(len(all_events) - 1):
            curr = all_events[i]
            next_ev = all_events[i + 1]
            
            # Mesmo vídeo, mesma sessão e mesmo tipo de evento
            if (
                curr.video_id == next_ev.video_id
                and curr.session_id == next_ev.session_id
                and curr.event_type == next_ev.event_type
            ):
                # Se a diferença de tempo for menor que 2 segundos
                diff = abs((next_ev.created_at - curr.created_at).total_seconds())
                if diff < 2.0:
                    duplicates_to_delete.append(next_ev.id)
        
        duplicates_to_delete = list(set(duplicates_to_delete))
        print(f"Eventos duplicados identificados: {len(duplicates_to_delete)}")
        
        if duplicates_to_delete:
            deleted_count = (
                db.query(VideoAnalytics)
                .filter(VideoAnalytics.id.in_(duplicates_to_delete))
                .delete(synchronize_session=False)
            )
            db.commit()
            print(f"Sucesso: {deleted_count} registros duplicados foram removidos do banco com sucesso!")
        else:
            print("Nenhum evento duplicado encontrado.")
            
        # Exibe resumo atualizado por vídeo
        print("\n--- Resumo de Métricas Pós-Limpeza ---")
        videos = db.query(Video).all()
        for v in videos:
            play_count = db.query(VideoAnalytics).filter(VideoAnalytics.video_id == v.id, VideoAnalytics.event_type == "play").count()
            impr_count = db.query(VideoAnalytics).filter(VideoAnalytics.video_id == v.id, VideoAnalytics.event_type == "impression").count()
            print(f"Vídeo '{v.title}' ({v.id[:8]}...): {play_count} plays totais, {impr_count} impressões")
            
    except Exception as e:
        db.rollback()
        print(f"Erro ao limpar duplicatas: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clean_duplicate_events()
