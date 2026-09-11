---
trigger: always_on
---

# Regra de Rastreabilidade e Logs (Backend)

Toda nova mecânica ou serviço criado no backend deve ser "rastreável" para facilitar o diagnóstico de erros em ambiente de produção (Docker logs).

**Protocolo Obrigatório:**
1. **Logs de Sucesso e Erro:** Utilize o objeto `logger` (ex: `from core.logger import logger`) para registrar o início, os marcos principais e o fim de processos críticos.
2. **Contexto no Erro:** Em blocos `try/except`, sempre use `logger.error` incluindo detalhes úteis (ex: ID da integração, tipo do evento, mensagem do erro original).
3. **Padrão de Mensagem:** As mensagens de log devem ser claras e em português (se possível) para facilitar a leitura rápida pelo usuário/desenvolvedor.
4. **Evite Verbosidade:** Não inunde o log com informações desnecessárias em loops repetitivos, a menos que esteja em modo debug.

Isso garante que problemas no servidor possam ser resolvidos rapidamente através da leitura dos logs do container.
