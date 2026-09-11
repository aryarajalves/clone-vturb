---
trigger: always_on
---

# Regra de Modularização e Arquitetura

Ao realizar refatorações ou expansões do sistema, a organização de arquivos deve seguir um padrão modular para evitar o acúmulo de lógica em arquivos únicos.

**Diretrizes de Modularização:**
1. **Pontos de Entrada (Barrels):** Ao quebrar um arquivo grande em uma pasta, mantenha um arquivo `index.jsx` (ou `__init__.py`) que atue como o exportador principal, mantendo a compatibilidade com os imports existentes no restante do projeto.
2. **Separação de Preocupações:**
   - **Frontend:** Separe a lógica de estado (Hooks customizados), a renderização (Componentes) e os utilitários em arquivos distintos.
   - **Backend:** Separe as rotas (Routers), os modelos de dados (Schemas/Models) e a lógica de negócio (Services).
3. **Proibição de Componentes Aninhados:** Não defina sub-componentes dentro do mesmo arquivo se eles possuírem lógica complexa ou mais de 50 linhas de código. Extraia para a pasta `components/`.

Isso mantém a base de código limpa, escalável e fácil de navegar.
