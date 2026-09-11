---
trigger: always_on
---

# Regra de Validação de Saúde e Integridade (Testes) - VERSÃO RÍGIDA

Sempre que você realizar uma alteração no código ou interface, você deve seguir este protocolo de validação ANTES de dar a tarefa como concluída. O descumprimento de qualquer ponto abaixo invalida o seu trabalho.

**Exceção de Apenas Subir/Reiniciar:** Caso a tarefa solicitada seja unicamente subir ou reiniciar os contêineres do projeto (sem modificações em arquivos de código ou layouts), o protocolo de testes unitários, smoke tests detalhados e prova visual de interface está dispensado. Basta confirmar que os serviços subiram de verdade e estão online.

**Protocolo Obrigatório de Evidências (Para alterações de código/tela):**
1. **Prova Visual Obrigatória:** É MANDATÓRIO usar o `browser_subagent` para capturar o estado final da interface. Você deve anexar o ID da gravação (`RecordingName`) ou o caminho da imagem na sua resposta final.
2. **Descrição do Teste Real:** Proibido usar apenas "testado". Você deve descrever o fluxo: "Acessei a página X, cliquei no elemento Y e validei que o estado mudou para Z".
3. **Smoke Test do Frontend:** Após reiniciar os containers, confirme que a página carregou (Status 200) e que não há uma "tela branca".
4. **Execução de Testes e Fluxos:** 
   - Rode os testes na pasta `tests/` e anexe o output do terminal.
   - **Teste de Fluxo Completo (Happy Path):** Realize o fluxo principal e valide a mudança de estado no banco de dados se necessário.
5. **Verificação de Fluxo de Dados (Data-Flow):** 
   - Se a tela deveria listar itens, prove que a lista não está vazia. Listas vazias indevidas indicam falha no teste.
   - Valide as chamadas de API (Network) e garanta que retornam Status 200.

**Relatório de Validação Obrigatório (Anexar ao fim de cada resposta):**
- [ID-GRAVACAO] ou [CAMINHO-IMAGEM] da validação final.
- [OK] Frontend acessível e funcional.
- [OK] Testes unitários aprovados (anexar output).
- [OK] Sem erros críticos nos logs (`docker logs`).

**Dizer que "está funcionando" sem anexar a prova visual ou o log de execução é uma violação desta regra.**
