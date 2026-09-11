---
trigger: always_on
---

# Regra de Experiência do Usuário (Feedback e UI)

A interface deve sempre transmitir confiança e clareza para o usuário final, mantendo o padrão "Premium".

**Protocolo Obrigatório:**
1. **Estados de Loading:** Toda ação assíncrona (clique em botão que faz requisição, salvamento, deleção) deve ter um estado visual de carregamento (spinner ou desativação do botão).
2. **Feedback por Toasts:** Utilize notificações (`toast.success`, `toast.error`) para confirmar o sucesso de ações ou explicar o motivo de falhas. Nunca deixe uma ação terminar sem um feedback visual claro.
3. **Persistência de Estilo:** Mantenha os componentes interativos dentro do padrão estético estabelecido (Glassmorphism, Neon, bordas suaves).

4. **Popups de Confirmação (Deleção):** Toda ação de "Delete" ou "Apagar" deve obrigatoriamente abrir um popup de confirmação centralizado na tela.
5. **Padrão de Popups:**
   - Devem ter um painel preto transparente (backdrop) cobrindo o fundo.
   - **NÃO** devem fechar ao clicar fora do painel central (fechamento forçado apenas via botão).
   - Devem possuir apenas **1 botão para fechar/cancelar** (além do botão de ação principal).

Isso garante que o usuário não apague dados por acidente e que a interface mantenha um comportamento previsível e seguro.
