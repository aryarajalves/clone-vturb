---
trigger: always_on
---

# Regra de Padrão de Commits (Conventional Commits)

Todas as mensagens de commit devem seguir o padrão **Conventional Commits** para manter o histórico legível e facilitar o rastreamento de bugs em produção.

**Formato obrigatório:**
```
<tipo>: <descrição curta em português>
```

**Tipos permitidos:**
| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Atualização de deps, configs, scripts sem impacto no usuário |
| `refactor` | Refatoração sem mudança de comportamento |
| `style` | Ajustes visuais/CSS sem mudança de lógica |
| `docs` | Alterações em documentação ou regras de agente |
| `test` | Adição ou correção de testes |

**Exemplos corretos:**
```
feat: adicionar envio de áudio em grupos
fix: corrigir toast de plano insuficiente no mobile
chore: atualizar dependências do backend
refactor: extrair WaStatusContext do App.jsx
style: ajustar cores do badge PRO/LITE no sidebar
docs: adicionar regra de gerenciamento de estado
test: adicionar teste de rota de revogar mensagem
```

**Exemplos incorretos (proibidos):**
```
ajuste
fix bug
testando
alteração
wip
```

**Idioma obrigatório: Português do Brasil**
- O título do commit **deve** estar em português do Brasil.
- A descrição do corpo (quando necessária) **deve** estar em português do Brasil.
- Nunca escrever mensagens de commit em inglês ou qualquer outro idioma.

**Regras adicionais:**
1. Descrição em letras minúsculas, sem ponto final.
2. Máximo de 72 caracteres na linha do título.
3. Se a mudança for grande, adicione um corpo explicativo após uma linha em branco, também em português.
4. Nunca use "WIP" como commit final — finalize antes de commitar.
