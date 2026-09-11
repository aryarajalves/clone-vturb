# Regra de Preservação de Processos do Usuário (Navegadores)

Toda vez que você for executar smoke tests, automações ou validações visuais que necessitem abrir o navegador Chrome (ou qualquer outro navegador/aplicação), você deve respeitar estritamente os processos que o usuário já possui abertos em sua máquina local.

**Protocolo Obrigatório:**
1. **Proibido Matar Processos Globais**: Nunca execute comandos como `kill`, `killall`, `taskkill` ou `Stop-Process` que finalizem de forma indiscriminada todos os processos com o nome do navegador (ex: `chrome.exe`), pois isso fecha as abas ativas do usuário e prejudica o seu fluxo de trabalho.
2. **Matar Apenas Processos Criados pela Automação**: Se você precisar limpar processos para evitar vazamentos de memória ou conexões pendentes, você deve rastrear o PID (Process ID) específico da instância do Chrome que você mesmo iniciou por comando no terminal ou por script, e finalizar única e exclusivamente esse PID.
3. **Usar Perfis Isolados**: Sempre inicialize suas instâncias de navegador utilizando caminhos de perfis temporários e isolados (ex: `--user-data-dir=C:\Users\aryar\chrome_temp_profile`), evitando conflito com a sessão de uso atual do usuário.

Isso garante uma convivência harmoniosa do agente de IA com o ambiente de desenvolvimento local do usuário.
