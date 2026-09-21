---
trigger: always_on
---

# Regra de Reinício e Validação de Serviços

1. **Atualizações com Hot Reload (HMR / Watcher):**
   - Durante o desenvolvimento contínuo (Modo Rápido), os volumes mapeados no Docker sincronizam o código imediatamente.
   - O frontend (Vite) e o backend (Uvicorn reload) atualizam instantaneamente sem necessidade de recriar containers a cada mensagem.

2. **Quando reiniciar os contêineres:**
   - Apenas quando houver alteração em dependências (`requirements.txt`, `package.json`), Dockerfile, variáveis de ambiente novas no container, ou a pedido explícito do usuário.
   - Ao reiniciar a pedido do usuário ou em Modo Completo, validar se a porta está respondendo (HTTP 200).
