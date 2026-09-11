---
trigger: always_on
---

# Regra de Integridade de Esquema (Banco de Dados)

Toda vez que você realizar uma alteração nos modelos (`models.py`) que envolva a criação de novas tabelas ou colunas, você deve garantir que a mudança seja rastreável e replicável.

**Protocolo Obrigatório:**
1. **Criação de Script de Migração:** Além de atualizar o `models.py`, você deve criar um script Python na pasta `backend/` (ou `backend/scripts/`) que execute o `ALTER TABLE` necessário. Use os scripts existentes (`add_delay_columns.py`, etc) como modelo.
2. **Atualização do Log:** Você deve registrar a alteração no arquivo `DATABASE_SCHEMA_LOG.md`, incluindo a data, a tabela afetada, as novas colunas e o nome do script de migração.
3. **Teste de Sincronia:** Se possível, execute o script no ambiente de desenvolvimento local para garantir que a sintaxe SQL está correta para o banco utilizado (SQLite ou PostgreSQL).
4. **Relatório Final:** Informe na sua resposta se houve alterações no banco de dados e qual script deve ser rodado para aplicá-las.

Isso evita que o sistema apresente erros de "Missing Column" ao ser implantado em novos servidores ou ambientes de produção.
