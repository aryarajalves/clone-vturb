---
trigger: always_on
---

# Regra de Limites de Código (Clean Code)

Para garantir que o projeto permaneça manutenível e que o agente consiga processar os arquivos sem perder o contexto, estabelecemos limites rígidos de tamanho de arquivo.

**Limites Obrigatórios:**
1. **Backend (Python):** Nenhum arquivo deve ultrapassar **1.000 linhas**.
2. **Frontend (React/JSX):** Nenhum arquivo deve ultrapassar **500 linhas**.

**Ações ao atingir o limite:**
- Se uma nova funcionalidade for fazer um arquivo ultrapassar esses limites (ou se o arquivo já estiver acima do limite), você **DEVE obrigatoriamente alertar o usuário e perguntar antes** se ele deseja realizar a modularização (quebra do arquivo) antes de prosseguir com a implementação.
- Ao propor a modularização, priorize a extração de componentes (frontend) e serviços/utilitários (backend) para arquivos separados.
- Aguarde a confirmação do usuário antes de realizar a quebra estrutural.

Isso evita a criação de "Arquivos Monolíticos" que são difíceis de testar e debugar, mantendo o usuário no controle do fluxo de refatoração.

