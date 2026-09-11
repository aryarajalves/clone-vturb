---
trigger: always_on
---

# Regra de Atualização do BUSINESS_RULES.md

Toda vez que criar ou atualizar uma funcionalidade e surgirem dúvidas sobre regras de negócio que o agente não consegue responder sozinho, as perguntas devem ser registradas no `BUSINESS_RULES.md` e o usuário deve ser notificado.

**Protocolo Obrigatório:**

1. **Identificar perguntas em aberto:** Ao implementar algo novo, se surgir uma decisão de negócio que depende de conhecimento do dono do projeto (ex: limites, comportamentos esperados, integrações, políticas), registre como pergunta.

2. **Adicionar ao BUSINESS_RULES.md:** Inclua a pergunta na seção mais relevante do arquivo, no formato:
```markdown
- [ ] [NOVO] <pergunta clara e objetiva sobre a decisão de negócio>
```

3. **Notificar o usuário ao final da resposta:** Sempre que adicionar perguntas novas, informe explicitamente ao final da resposta:
```
> 📋 **Perguntas novas adicionadas ao BUSINESS_RULES.md:** <lista resumida das perguntas>
```

4. **Marcar como respondida:** Quando o usuário responder uma pergunta, atualize o `BUSINESS_RULES.md` substituindo `- [ ]` por `- [x]` e registre a resposta abaixo da pergunta.

5. **Nunca inventar regras de negócio:** Se não há resposta no `BUSINESS_RULES.md` e a decisão impacta o comportamento do sistema, pergunte ao usuário antes de implementar — não assuma.
