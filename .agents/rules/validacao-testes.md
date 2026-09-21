---
trigger: always_on
---

# Regra de Validação de Testes Unitários e Modos de Execução

## 1. Modos de Execução: Modo Rápido (Padrão) vs Modo Completo

- **Modo Rápido (Foco em Agilidade e Testes Unitários):**
  - O foco total é na implementação do código e nos **testes unitários** (Frontend Vitest e Backend Pytest) para garantir ausência de bugs e regressões.
  - **Dispensado:** Captura de prints visuais antes/depois (Playwright headless) e reinício forçado de containers via `--force-recreate` a cada mensagem.
  - O Vite possui Hot Module Replacement (HMR) e os volumes do Docker sincronizam os arquivos automaticamente em milissegundos.

- **Modo Completo (Apenas quando solicitado explicitamente):**
  - Inclui prova visual comparativa (prints) e reinício completo dos contêineres.

## 2. Protocolo de Pergunta ao Usuário
- Sempre que o usuário solicitar uma nova funcionalidade ou alteração e **NÃO** especificar se deseja o Modo Rápido ou Completo, o agente deve **perguntar ao usuário** para que ele possa escolher.
- Se o usuário já tiver especificado o modo na mensagem, o agente segue diretamente sem perguntar.

## 3. Garantia de Testes Unitários (MANDATÓRIO)
- Toda nova funcionalidade deve possuir testes unitários no Frontend (`npm test -- --run`) e/ou Backend (`docker exec backend pytest tests`).
- Se houver atualização em algo existente, os testes unitários correspondentes devem ser atualizados.
- O agente deve sempre rodar os testes e confirmar que passaram 100% sem erros.
