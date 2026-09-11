---
trigger: always_on
---

# Regra de Segurança e Configurações (.env)

Toda vez que você criar uma nova funcionalidade que dependa de uma variável de ambiente ou configuração externa, você deve garantir que o sistema seja configurável em novos ambientes.

**Protocolo Obrigatório:**
1. **Atualização do .env.example:** Se você adicionar um novo `os.getenv("NOVA_VAR")` no backend, você **DEVE** adicionar essa variável ao arquivo `.env.example` na raiz do projeto com um valor de exemplo ou descrição.
2. **Documentação de Dependências:** Se a funcionalidade exigir uma nova URL ou Token (ex: ManyChat, Typebot), informe na sua resposta final quais variáveis o usuário precisa configurar no `.env` real dele.
3. **Não Exposição de Segredos:** Nunca exiba valores reais de chaves privadas, senhas ou tokens em logs ou prints de tela. Use máscaras (ex: `sk-****1234`).

Isso garante que o projeto continue sendo "portável" para novos servidores sem erros de configuração.
