---
trigger: always_on
---

# Regra de Sincronização do .env.example

O arquivo `backend/.env.example` deve sempre estar atualizado com **todas** as variáveis de ambiente usadas no código Python. Ele é a única fonte de verdade para configurar o projeto em um novo servidor.

**Protocolo Obrigatório:**

1. **Toda vez que adicionar um `os.getenv("NOVA_VAR")`** em qualquer arquivo Python, adicione imediatamente a variável correspondente no `backend/.env.example` com:
   - Valor de exemplo (nunca o valor real)
   - Comentário explicando o que é e onde é usado

2. **Formato obrigatório:**
```env
# Descrição clara do que é a variável e onde é usada
NOME_DA_VAR=valor_de_exemplo
```

3. **Nunca commitar o `.env` real** — ele contém credenciais reais. Apenas o `.env.example` vai para o repositório.

4. **Ao entregar uma tarefa que adicionou novas variáveis**, informe explicitamente na resposta quais variáveis o usuário precisa preencher no `.env` real.

5. **Variáveis obrigatórias vs opcionais:** Marque com `# [OBRIGATÓRIO]` ou `# [OPCIONAL]` para facilitar o setup em produção.

**Arquivo de referência:** `backend/.env.example` na raiz do backend.
