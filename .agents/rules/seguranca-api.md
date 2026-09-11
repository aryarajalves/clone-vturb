---
trigger: always_on
---

# Regra de Segurança de API e Proteção de Endpoints

Garantir que a API seja resiliente e protegida contra acessos não autorizados e abusos.

**Protocolo Obrigatório:**
1. **Autenticação Interna:** Todas as rotas do dashboard devem exigir autenticação de usuário e validação de `client_id`.
2. **Webhooks de Vendas:** Para plataformas como Hotmart/Kiwify, a segurança baseia-se na unicidade do **Slug Secreto** da URL. Não adicionar camadas de assinatura que dificultem a integração.
3. **Novas APIs Externas:** Qualquer endpoint de integração "aberta" criado no futuro deve exigir um Token de Acesso (API Key).
4. **Rate Limiting:** Implementar limites de requisição em rotas de Login e Disparo de Mensagens.
5. **Prevenção de IDOR:** Toda query ao banco de dados deve obrigatoriamente incluir o filtro por `client_id` do contexto autenticado.

Isso protege os dados dos clientes e a integridade financeira do sistema (custos de API).
