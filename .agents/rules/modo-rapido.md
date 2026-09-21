---
trigger: always_on
---

# Regra de Escolha de Modo (Modo Rápido vs Modo Completo)

Toda vez que o usuário pedir para criar algo novo ou realizar uma alteração no sistema:

1. **Se o usuário NÃO especificou o modo na mensagem:**
   - O agente DEVE perguntar ao usuário antes ou logo no início da resposta (ou usando a ferramenta interativa `ask_question`), oferecendo as opções:
     - **Modo Rápido (Recomendado):** Foco em implementar a alteração com rapidez e criar/executar os testes unitários (Frontend e Backend) para garantir que não há bugs. Sem captura de prints de tela headless e sem reiniciar containers.
     - **Modo Completo:** Inclui prova visual comparativa (prints de antes e depois via Playwright) e reinício de contêineres Docker.

2. **Se o usuário já especificou o modo (ex: "em modo rápido", "modo rápido", etc.):**
   - Não pergunte novamente. Siga diretamente no Modo Rápido:
     - Implementar o código limpo;
     - Criar/atualizar os testes unitários;
     - Rodar a suíte de testes unitários para comprovar que não há bugs;
     - Responder com agilidade ao usuário.
