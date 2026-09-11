---
trigger: always_on
---

# Repositório GitHub do Projeto

O repositório oficial do projeto é:

**URL:** https://github.com/aryarajalves/clone-vturb.git

**Protocolo Obrigatório:**
1. Todo `git push` deve ser direcionado para este repositório.
2. Nunca fazer push para outro remote sem autorização explícita do usuário.
3. Antes de sugerir qualquer operação de push, confirmar com o usuário.
4. O branch principal é o `main` — nunca fazer force push no `main`.
5. Toda mensagem de commit (título e corpo) deve obrigatoriamente estar em **português do Brasil**.
6. É OBRIGATÓRIO manter o arquivo `README.md` atualizado com a versão corrente antes de realizar qualquer commit ou push.
7. É OBRIGATÓRIO executar a auditoria de segurança de dependências (`pip-audit`) antes de qualquer commit ou push no repositório, garantindo que o código enviado esteja livre de vulnerabilidades conhecidas.

## 🛡️ Auditoria de Segurança de Dependências (pip-audit) Antes do Push

**Antes de qualquer `git push` ou atualização no repositório, é obrigatório executar a verificação de segurança das bibliotecas:**
1. Executar o script de auditoria:
   ```bash
   python scripts/audit_security.py
   ```
   *(ou `$env:PYTHONUTF8="1"; python -m pip_audit -r backend/requirements.txt`)*
2. Certificar-se de que as dependências do `backend/requirements.txt` foram auditadas e estão sem vulnerabilidades críticas conhecidas.

## 🧹 Limpeza Obrigatória da Raiz Antes do Push

**Antes de qualquer `git push`, o agente DEVE inspecionar a raiz do projeto e deletar os seguintes tipos de arquivo caso existam:**

### Arquivos que DEVEM ser deletados se existirem na raiz (apenas arquivos inúteis/temporários):
- `screenshot*.png` — prints de validação visual gerados pelos agentes
- `fixed_layout_*.png`, `modal_saved_*.png` e qualquer outro `.png` de evidência
- `chrome_*.log`, `chrome_err.log`, `chrome_headless.log`, etc. — logs do browser do agente
- `zapvoice_debug.log` e qualquer outro `.log` solto na raiz
- `test_*.db`, `zapvoice.db` e qualquer outro `.db` solto na raiz (bancos de teste temporários)

### 🚫 PROIBIDO DELETAR:
- **NUNCA deletar** arquivos de código Python (`.py`), componentes frontend (`.jsx`, `.js`, `.tsx`, `.ts`), testes unitários ou arquivos de estilo da aplicação.
- O arquivo `verify_system.py` na raiz é protegido e nunca deve ser deletado.

### Protocolo de execução:
1. Rodar `git status` para ver todos os arquivos não rastreados (`??`) e modificados.
2. Identificar na raiz qualquer arquivo de log, print temporário ou lixo que se encaixe nos padrões acima.
3. **MANDATÓRIO:** O agente deve listar explicitamente para o usuário quais arquivos encontrou e pretende deletar.
4. **PROIBIDO:** Nunca executar `git clean -fd` ou deletar arquivos de código/untracked sem consentimento explícito e sem exibir a listagem prévia.
5. Deletar os arquivos de lixo apenas após listar/confirmar, antes de fazer o `git add` e o commit.
6. Só então prosseguir com o commit e o push.