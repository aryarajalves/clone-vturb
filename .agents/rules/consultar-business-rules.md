---
trigger: always_on
---

# Regra de Consulta ao BUSINESS_RULES.md

Antes de implementar qualquer funcionalidade nova ou alterar um comportamento existente, o agente deve consultar o arquivo `BUSINESS_RULES.md` na raiz do projeto.

**Protocolo Obrigatório:**

1. **Consulta obrigatória antes de codar:** Leia o `BUSINESS_RULES.md` sempre que a tarefa envolver:
   - Criação de nova funcionalidade
   - Alteração de lógica de negócio existente (ciclos, disparos, funnels, permissões, planos)
   - Integração com W-API ou plataformas externas
   - Qualquer decisão que dependa de regras do domínio do negócio

2. **Prioridade sobre suposições:** Se o `BUSINESS_RULES.md` tiver uma regra documentada, ela tem prioridade sobre qualquer inferência feita a partir do código.

3. **Perguntas em aberto bloqueiam implementação:** Se houver uma pergunta `- [ ]` no `BUSINESS_RULES.md` diretamente relacionada à tarefa solicitada, informe o usuário antes de implementar e aguarde resposta.

4. **Arquivo de referência:** `BUSINESS_RULES.md` na raiz do projeto.
