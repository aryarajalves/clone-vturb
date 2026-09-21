---
trigger: always_on
---

# Regra de Integridade Estética e Design System

1. **Preservação de Estilo:**
   - Toda alteração de Frontend deve manter o padrão estético premium (Glassmorphism, Neon, bordas suaves, paleta consistente).
   - Proibido cores genéricas ou estilos desalinhados com o layout existente.

2. **Padronização de Popups:**
   - Popups devem ser centralizados, com painel preto translúcido (backdrop) cobrindo o fundo e fechamento apenas via botão (sem fechar ao clicar fora).

3. **Captura Visual (Snapshots):**
   - A captura de prints via Playwright/browser headless **NÃO** é executada no Modo Rápido para garantir resposta veloz (em menos de 1-2 minutos).
   - Deve ser executada somente quando o usuário solicitar o Modo Completo ou pedir prints explicitamente.
