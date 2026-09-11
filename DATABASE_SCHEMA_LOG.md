# Registro de Alterações de Esquema do Banco de Dados (DATABASE_SCHEMA_LOG.md)

Este arquivo registra todas as migrações e modificações estruturais nas tabelas do PostgreSQL.

| Data | Tabela Afetada | Colunas / Alterações | Script de Migração | Status |
|---|---|---|---|---|
| 2026-09-10 | `videos` | Criação da tabela (id, title, video_url, thumbnail_url, duration, player_settings, created_at, updated_at) | `backend/scripts/create_video_tables.py` | Concluído |
| 2026-09-10 | `video_analytics` | Criação da tabela (id, video_id, event_type, watch_time_seconds, session_id, referer, created_at) | `backend/scripts/create_video_tables.py` | Concluído |
