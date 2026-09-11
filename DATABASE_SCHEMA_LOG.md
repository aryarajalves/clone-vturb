# Log de Esquema do Banco de Dados (Database Schema Log)

Registro histórico de alterações de tabelas, colunas e índices do banco de dados (PostgreSQL / SQLite).

---

## 2026-09-11 - Adição da coluna 'name' na tabela 'users'
- **Tabela afetada:** `users`
- **Nova coluna:** `name VARCHAR(255) NULL`
- **Motivo:** Exibição do nome de perfil do usuário na barra lateral (Sidebar) e suporte a identificação amigável.
- **Script de migração:** `backend/scripts/add_user_name_column.py`
- **Comando de execução:** `docker exec backend python scripts/add_user_name_column.py`

---

## 2026-09-11 - Adição de role em users e criação da tabela user_invites
- **Tabelas afetadas:** `users`, `user_invites`
- **Alterações:**
  - `users`: Adicionada coluna `role VARCHAR(50) DEFAULT 'user' NOT NULL`
  - `user_invites`: Criação da tabela completa para links de convite (token, role, expires_at, is_used, used_by_email, created_by_user_id, created_at)
- **Script de migração:** `backend/scripts/add_user_roles_and_invites.py`
- **Comando de execução:** `docker exec backend python scripts/add_user_roles_and_invites.py`

---

## 2026-09-10 - Criação da tabela users
- **Tabela afetada:** `users`
- **Estrutura:** `id`, `email`, `password_hash`, `is_super_admin`, `created_at`, `updated_at`
- **Script de criação:** `backend/scripts/create_user_tables.py`

---

## 2026-09-08 - Criação da tabela videos e mecânicas avançadas
- **Tabela afetada:** `videos`
- **Estrutura:** Suporte a upload, streaming B2/local, modo turbo, smart autoplay, player flutuante, pitch delay e pixels.
- **Script de criação:** `backend/scripts/create_video_tables.py`
