---
trigger: always_on
---

# Regra de Integridade Estética e Design System

Toda alteração de Frontend ou CSS deve preservar a identidade visual "Premium". A validação visual não é opcional.

**Protocolo Obrigatório:**
1. **Snapshot Comparativo (Antes/Depois):** É OBRIGATÓRIO capturar uma imagem da interface antes e outra depois da alteração usando o `browser_subagent`.
2. **Evidência Visual na Resposta:** Você deve anexar o link ou ID da imagem do "Depois" na sua resposta final. Se houver mudança de layout, anexe ambas para comparação.
3. **Preservação de Estilo:** Proibido cores genéricas ou estilos inline. Respeite o Glassmorphism e o sistema de design estabelecido.
4. **Padronização de Popups:** Popups devem ser centralizados, com backdrop transparente e sem fechamento por clique externo.

**Sem a evidência visual do "Depois", a tarefa de frontend é considerada incompleta.**
