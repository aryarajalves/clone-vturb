---
trigger: always_on
---

# Regra de Reinício Automático e Validação de Conectividade

Toda vez que você criar uma nova mecânica, interface ou código Python, você deve reiniciar os containers imediatamente. O reinício só é considerado bem-sucedido se o serviço for validado como "Online".

**Exceção de Apenas Subir/Reiniciar:** Si a tarefa for estritamente subir ou reiniciar os contêineres a pedido do usuário (sem qualquer alteração de código, mecânica ou interface), você NÃO precisa seguir as regras complexas de validação visual, testes unitários ou smoke tests detalhados. Basta subir os contêineres e observar se os serviços realmente subiram e estão respondendo nas portas correspondentes.

**Requisitos Obrigatórios (Para alterações de código/tela):**
1. **Limpeza de Cache e Recriação:** Use sempre `--force-recreate` para assegurar que as atualizações foram aplicadas e o cache limpo.
2. **Validação de Conectividade:** Após o comando de reinício, você DEVE validar se a porta está respondendo (ex: usando `curl -I` ou o `browser_subagent`).
3. **Transparência e Logs:** Informe quais containers foram reiniciados e anexe um trecho do log de boot (`docker logs --tail 20`) para provar que o serviço subiu sem erros.

Isso garante que o sistema sempre reflita a versão mais recente e que o agente não deixe o sistema "fora do ar" após um deploy mal sucedido.
