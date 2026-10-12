# Regras de Negócio - ProjetoVturb

Documento de referência para decisões de arquitetura e produto do ProjetoVturb.

---

## 1. Importação e Hospedagem de Vídeos
- [x] Cada vídeo cadastrado possui título, URL do vídeo, capa e opções visuais.
- [x] O upload inicial de vídeo aceita tanto arquivos locais (armazenados em static/uploads) quanto URLs diretas de CDN/S3/HLS, bem como upload de imagens para capas de thumbnail.
- [x] Hospedagem e CDN de Vídeos com Backblaze B2 e Cloudflare:
  - Bucket: `zap-voice`
  - Endpoint: `https://s3.us-west-004.backblazeb2.com`
  - CDN Cloudflare CNAME: `https://midia.aryaraj.shop/file/zap-voice` (amigável, tráfego gratuito via Bandwidth Alliance e cache edge no Brasil).
  - O sistema gera e normaliza URLs garantindo conformidade com o formato `/file/<bucket>/<arquivo>`.

---

## 2. Código de Incorporação (Embedding)
- [x] O sistema deve gerar código iframe e script embed para que o usuário possa colar em qualquer landing page externa.
- [x] O embed permite personalizar largura máxima (presets 640px, 800px, 960px, 100% responsivo ou customizada) e proporção/altura (16:9, 9:16 vertical, 4:3 ou altura fixa em px).
- [x] A página do player em `/embed/:videoId` é independente e otimizada para carregamento ultra-rápido.
- [x] O player possui suporte nativo a botão de CTA dinâmico configurável com tempo de delay (pitch), link e texto customizados.

---

## 3. Métricas e Performance (Analytics)
- [x] O player embedado dispara eventos em tempo real (`impression`, `play`, `progress` em 25%, 50%, 75%, 100%, `cta_reached`, `pitch_reached` e `click`).
- [x] Prevenção de duplicação de impressões por duplo carregamento/StrictMode com flag de ciclo de vida e deduplicação estrita por espectador único (`DISTINCT session_id`).
- [x] **Blindagem de Precisão nas Métricas (Quiz & Embeds Externos)**:
  1. **Bloqueio de Telemetria em Smart Autoplay Mudo**: Enquanto o vídeo estiver apenas rodando mudo atrás da capa do Smart Autoplay (*"Clique para Ouvir"*), o player bloqueia o disparo de `progress_25`, `progress_50`, `progress_75`, `progress_100`, `cta_reached`, `pitch_reached` e pixels de conversão, contabilizando retenção e alcance da oferta estritamente após o espectador iniciar/desmutar a reprodução. No backend, apenas sessões com evento `play` registrado são elegíveis para contagem nos marcos de retenção e alcance da CTA.
  2. **Detecção de Visibilidade Real (`IntersectionObserver` & `isElementCurrentlyVisible`)**: Se a página externa (ex: Quiz multi-etapas) pré-carregar o `<iframe>` oculto (`display: none`, `visibility: hidden` ou dimensões `0x0`), o player aguarda ficar efetivamente visível na tela do visitante antes de registrar `impression` e iniciar o autoplay/play.
  3. **ID de Visitante 1st-Party Persistente (`?sid=`)**: O script de incorporação sincroniza o `vturb_visitor_id` a partir do `localStorage` primário da página mãe (1st-party) para a URL do `<iframe>` (`?sid=...`) com fallback em `sessionStorage`, impedindo duplicação de sessões em navegadores In-App (Instagram/Facebook Ads) e Safari iOS (ITP).
- [x] O painel apresenta indicadores de:
  - Total de Impressões (Visualizações totais do Player)
  - Impressões Únicas (Visitantes distintos identificados por session_id persistente)
  - Total de Plays e Plays Únicos
  - Play Rate (% que deram play sobre impressões)
  - Retenção Média de Tempo Assistido e Funil (25%, 50%, 75%, 100%)
  - Cliques no Player / CTA (CTR)
- [x] Toda agregação respeita o identificador do vídeo.
- [x] Filtros por data e período: suporte a Hoje (`today`), Ontem (`yesterday`), 7 Dias (`7d`), 30 Dias (`30d`), 1 Ano (`1y`), Todo o Período (`all`) e Intervalo Personalizado (De / Até).
- [x] Gráfico estilo VTurb de distribuição horária (24 horas) com identificação automática do horário de pico de acessos/plays e consolidação por turnos (madrugada, manhã, tarde, noite).
- [x] Gráfico Oficial VTurb de Retenção & Audiência: Gráfico com visual dark (#000000), imagem do vídeo centralizada na área gráfica com efeito de fusão, curva SVG verde neon suave, eixos Y (0% a 100%) e X com timestamps calculados pela duração real do vídeo (com auto-detecção e persistência automática de `duration` via metadados HTML5 quando o vídeo possui `duration <= 0`), linha vertical tracejada interativa (scrubber com ponto verde centralizado na linha via interpolação cúbica de Bézier exata por Newton-Raphson) e tooltip flutuante exibindo tempo/horário, audiência e retenção, além de sub-navegação por Dispositivos, Navegadores, Países e Origem do Tráfego.
- [x] **Configuração Rápida e Métrica de Alcance da Oferta (CTA)**:
  - Na própria aba **Métricas**, há uma barra de configuração rápida (**Momento da Oferta / CTA**) onde o usuário define o minuto e segundo exatos da oferta (ex: `02:15`).
  - Ao configurar o horário da CTA, o painel exibe em destaque imediato:
    1. **Card "🎯 Chegaram na Oferta (CTA)"** na Visão Geral, mostrando o número exato de espectadores únicos que assistiram até o segundo da oferta (`audience_reached`) e a porcentagem de retenção na oferta (`retention_percent`).
    2. **Marcador Vertical no Gráfico de Retenção** (`🎯 Oferta MM:SS`) indicando visualmente na curva onde a oferta entra.
    3. **Barra Destacada no Funil de Retenção** exibindo a conversão até o momento da CTA junto aos marcos de 25%, 50%, 75% e 100%.
- [x] Todo cálculo de data, filtros de período (Hoje, Ontem, etc.) e distribuição horária (00h às 23h) é obrigatoriamente referenciado no Horário Oficial de Brasília (BRT / UTC-3, fuso America/Sao_Paulo).
- [x] **Rastreamento e Histórico de Contatos / Leads na VSL**:
  - **Recepção de Leads via POST**: Endpoint aberto (`POST /videos/lead-event` e `POST /videos/lead-play`) preparado para receber o payload de identificação de play:
    ```json
    {
      "event": "vsl_play",
      "video_id": "<uuid-do-video>",
      "name": "Nome do Lead",
      "phone": "+55 (18) 99787-7100",
      "lead_id": "20260928-164404-3054288f"
    }
    ```
  - **Captura Flexível Dupla**: Além do webhook/POST direto, o player embedado captura automaticamente parâmetros da URL do `<iframe>` (`?name=...&phone=...&lead_id=...`) e eventos `window.postMessage({ type: 'VTURB_IDENTIFY', name, phone, lead_id })`, disparando a identificação no primeiro play do visitante.
  - **Sincronização Temporal Contínua**: À medida que o lead assiste a VSL, eventos de telemetria (`progress_25`, `progress_50`, `progress_75`, `progress_100` e alcance do momento da oferta `cta_reached` / `pitch_reached`) atualizam dinamicamente a retenção máxima do contato e marcam se ele alcançou a oferta.
  - **Visualização Dedicada na Aba "Contatos" do Card de Métricas**:
    - Sub-aba dedicada **"Contatos"** incorporada à barra de navegação do gráfico de retenção oficial do VTurb.
    - **Cards de Resumo**: Total de contatos únicos que deram play, total e % que chegaram na oferta e retenção média.
    - **Tabela com Visual Dark Neon**: Exibição de Avatar + Nome do contato, WhatsApp formatado com link direto para conversa (`https://wa.me/...`), Lead ID com botão de cópia de 1 clique, data e horário do play formatados no Horário Oficial de Brasília (`DD/MM/YYYY às HH:mm`), barra de progresso visual com tempo assistido (`MM:SS`) e badge indicativo de oferta alcançada (`🎯 Chegou na Oferta`).
    - **Paginação de Contatos (Máx. 20 por página)**: A tabela exibe no máximo 20 contatos por vez, com controles de navegação (Anterior, Próximo e botões numéricos de página), resumo descritivo de registros exibidos e reset automático para a página 1 ao filtrar pelo campo de busca.
    - **Filtro de Período Sincronizado**: A lista de contatos, cards de resumo e paginação respeitam rigorosamente o seletor de período global de métricas (**Hoje**, **Ontem**, **7 Dias**, **30 Dias**, **1 Ano**, **Todo o Período** ou **Personalizado**), calculados no Horário Oficial de Brasília (BRT / UTC-3). Ao alternar o período no topo da página, os contatos são recarregados dinamicamente para o intervalo selecionado.


---

## 4. Recursos Avançados do Player (Modo Turbo)
- [x] O painel de gerenciamento do vídeo conta com a aba lateral "Turbo".
- [x] Possui switch de ativação dedicado ("Ativar Modo Turbo") no banner principal para ligar e desligar a aceleração a qualquer momento, atualizando o badge da barra lateral ("Ativo" / "Off").
- [x] Permite configurar a velocidade de reprodução do vídeo entre 0.5x (câmera lenta/mais devagar) até 2.0x (ultra-rápido/acelerado), com prévia ao vivo e ajuste fino.
- [x] O player embedado aplica nativamente a velocidade configurada (`playbackRate`) quando o Turbo está ativado, reproduzindo em velocidade normal (1.0x) caso desativado.

---

## 5. Gerenciamento e Exclusão em Massa de Vídeos
- [x] O usuário pode selecionar vídeos individualmente via checkbox ou selecionar todos os vídeos de uma só vez (checkbox mestre no topo da lista).
- [x] Ao selecionar um ou mais vídeos, é exibida uma barra de ações em lote destacando a quantidade de vídeos selecionados e o botão de exclusão em lote ("Excluir selecionados").
- [x] Toda ação de exclusão em massa requer confirmação prévia em um popup/modal centralizado com backdrop escuro transparente.
- [x] O popup de exclusão NÃO fecha ao clicar fora do painel central (fechamento apenas via botões "Cancelar" ou "Sim, Excluir"), garantindo a segurança contra exclusões acidentais.
- [x] A listagem de vídeos exibe no máximo 20 vídeos por página com paginação visual.
- [x] A listagem de vídeos exibe a data e o horário exato (hora e minuto) de criação/upload do vídeo formatados no padrão brasileiro (ex: "DD/MM/YYYY às HH:mm") referenciados no Horário Oficial de Brasília (America/Sao_Paulo).

---

## 6. Funcionalidades Avançadas do Player (Configuráveis por Vídeo na Barra Lateral)
- [x] Cada recurso avançado pode ser ativado ou desativado individualmente nas configurações de cada vídeo específico, com switches independentes e acesso dedicado na barra lateral de edição (organizados em 6 grupos/itens principais, com o submenu colapsável **Controles** agrupando 4 recursos dedicados).
- [x] **Menu Expansível Controles na Barra Lateral**:
  - A barra lateral de edição organiza as opções de controle do player sob o botão "Controles" com ícone dedicado e seta indicativa (chevron) que rotaciona ao expandir/recolher.
  - Ao clicar no botão "Controles", o submenu se expande revelando os 4 botões de configuração com recuo e guia visual: **Turbo**, **Smart Autoplay**, **Player Flutuante** e **Conteúdo Oculto**.
  - Cada botão do submenu mantém seu badge independente de status ("Ativo" / "Off") e ícone temático, destacando o botão ativo e mantendo o grupo Controles aberto automaticamente quando qualquer uma de suas sub-opções estiver selecionada.
- [x] **Aba de Estilização e Controles Visuais do Player**:
  - Acesso direto via botão "Estilização" na barra lateral de gerenciamento do vídeo.
  - Exibe na parte central a visualização interativa em tempo real do próprio vídeo, com suporte tanto ao modo **Widescreen (16:9)** quanto ao **Modo Vertical para Celular (9:16)**.
  - Slider para ajuste dinâmico de **Cantos Arredondados (0 a 20 px)** com badge numérico em tempo real.
  - Painel escuro estilizado com controles: **Barra de progresso**, **Tempo do Vídeo** (indicando o tempo restante em contagem regressiva para acabar o vídeo), **Voltar 10s**, **Avançar 10s**, **Volume**, **Fullscreen** e **Controle de velocidade**.
  - **Marcadores de Capítulos (`chapters`)**: Divisão do vídeo em múltiplos capítulos nomeados com timestamps (ex: `00:00`, `00:50`), renderizando uma barra de progresso segmentada interativa com navegação direta por clique.
  - Configurações visuais adicionais: Paleta de cores de destaque com presets e seletor hexadecimal, formato do botão de play (Circular, Retangular, Quadrado, Minimalista) e tamanho do botão (Pequeno, Médio, Grande).
  - Persistência das opções no objeto `player_settings` (`border_radius`, `aspect_ratio`, `controls_config` e `chapters`).
- [x] **Smart Autoplay™ & Autoplay Direto com Som**:
  - Permite escolher entre dois modos de inicialização automática ao ativar o recurso:
    1. **Smart Autoplay™ (Padrão)**: Inicia o vídeo de forma automática e mudo para contornar o bloqueio de autoplay dos navegadores modernos, exibindo uma chamada animada customizável para desmutar com 1 clique ("CLIQUE PARA OUVIR"), personalização de tamanhos (Mini, Pequeno, Médio, Grande), cores e opção de reiniciar o vídeo do início ao desmutar.
    2. **Autoplay Direto com Som**: Inicia a reprodução imediatamente com som ligado assim que o visitante acessa a página, sem cards, banners ou overlays na frente do vídeo.
       - **Atributos de Iframe Padronizados**: Códigos de embed gerados utilizam `allow="autoplay *; fullscreen *; encrypted-media *"` para conceder delegação de permissão de áudio autônomo pelo navegador pai.
       - **Desbloqueio Autônomo e Transparente de Áudio**: Caso o navegador do visitante tenha política restrita de autoplay sem engajamento prévio (MEI), o vídeo começa reproduzindo e o script pai ouve a primeira interação do usuário na página (clique, toque ou scroll) emitindo `VTURB_PARENT_INTERACTION`, desmutando o áudio instantaneamente em 100% de volume sem exibir qualquer botão ou overlay na frente do vídeo.
  - Na barra lateral, reflete dinamicamente o status e ícone correspondente ("Smart Autoplay" ou "Autoplay Direto").
- [x] **Player Flutuante (Picture-in-Picture / Mini-Player)**:
  - Mantém o vídeo visível fixando-o em miniatura no canto da tela (`bottom-right` ou `bottom-left`) assim que o player principal sai do campo de visão durante o scroll.
  - Largura configurável (ex: 320px) com sombra e bordas arredondadas no padrão premium, incluindo botão para fechar a miniatura a qualquer momento.
- [x] **Mostrar Conteúdo Oculto (Pitch Delay da Página)**:
  - Sincroniza o momento exato da oferta do vídeo (tempo em segundos) com a revelação instantânea de seções ocultas da página (ex: `.delay-pitch`, botões de checkout).
  - Emite `postMessage` (`VTURB_PITCH_REACHED`) para a janela mãe com o seletor CSS do elemento e parâmetros de auto-scroll suave e persistência no `localStorage`.
- [x] **Pixels de Rastreamento (Facebook Pixel, Google Tag/Analytics, TikTok)**:
  - Dispara eventos de conversão e métricas de retenção em marcos críticos de reprodução: 25%, 50%, 75%, 100% e no Pitch.
  - Emite `postMessage` (`VTURB_PIXEL_TRACK`) com payload tipado e invoca diretamente `fbq`, `gtag` e `ttq` caso disponíveis.
- [x] **Segurança e Domínios Autorizados (Whitelist & Anti-Download)**:
  - Whitelist de domínios permitidos: restringe a reprodução do vídeo exclusivamente aos domínios cadastrados (com suporte a wildcards e subdomínios), bloqueando embeds piratas ou não autorizados com tela de aviso.
  - Proteção anti-download: desabilita o menu de contexto (clique com o botão direito) e bloqueia download direto adicionando `controlsList="nodownload"` ao elemento `<video>`.

---

## 7. Autenticação, Super Admin e Segurança de Acesso
- [x] **Conta Super Admin Automática via Variáveis de Ambiente**:
  - As credenciais do administrador mestre são parametrizadas no `.env` (`SUPER_ADMIN_EMAIL` e `SUPER_ADMIN_PASSWORD`).
  - Durante o boot do backend (lifespan), o sistema verifica e cria a conta no banco de dados se não existir, ou sincroniza a senha caso a variável seja alterada.
  - Não pode haver mais de um Super Admin. Apenas administradores comuns (`admin`) e usuários (`user`) podem ser criados.
- [x] **Criptografia Memory-Hard contra Força Bruta (Argon2id)**:
  - Todas as senhas de usuários são criptografadas com o algoritmo vencedor do Password Hashing Competition: **Argon2id** (via `argon2-cffi`).
  - Parâmetros de proteção estritos: custo de memória de 64 MB (`memory_cost=65536`), 3 iterações (`time_cost=3`) e 4 threads de paralelismo (`parallelism=4`).
- [x] **Proteção de Rotas com Tokens JWT**:
  - Todos os endpoints administrativos do dashboard exigem cabeçalho `Authorization: Bearer <token>`. Duração padrão de 24 horas (`JWT_ACCESS_TOKEN_EXPIRE_HOURS=24h`).
- [x] **Interface de Login e Topbar**:
  - Layout dividido em 2 colunas: formulário à esquerda e showcase à direita.
  - Topbar inclui o e-mail do usuário logado, badge de perfil e botão "Sair".
  - A ação de sair exige confirmação em modal centralizado com fundo escuro translúcido.

---

## 8. Gestão de Usuários, Links de Convite e Cadastro Seguro
- [x] **Hierarquia de Perfis e Permissões**:
  - `SuperAdmin`: Perfil mestre oficial do sistema. Visualiza os botões "Gestão de Usuário" e "Backup Automático". É imutável, nunca pode ser excluído nem via endpoint individual nem em lote (`HTTP 400`). Nunca pode ser criado via convite.
  - `Admin`: Perfil administrativo criado via link de convite. Possui acesso total e visualiza o botão "Gestão de Usuário" na barra lateral para convidar e gerenciar usuários, não possuindo acesso à rotina de Backup Automático.
  - **Ocultação da Conta do Super Admin para Administradores**: Quando um usuário com perfil `Admin` acessar a tela de Gestão de Usuários, a conta do Super Admin oficial é completamente oculta da listagem (tanto no backend `/users/` quanto nos contadores e tabela do frontend), impedindo que o Administrador visualize os dados ou a existência da conta do Super Admin. O filtro de funções para o Admin também omite a opção "Super Admin".
  - `Usuário`: Perfil de usuário padrão criado via link de convite.
  - Usuários comuns (`role: 'user'`) não visualizam os botões de Gestão de Usuário nem de Backup Automático na barra lateral.
  - Nenhum usuário pode excluir a si mesmo enquanto estiver autenticado.
- [x] **Abas e Paginação**:
  - Abas separadas para "Usuários Ativos" e "Convites Gerados" com contadores dinâmicos.
  - Paginação limitando a exibição em no máximo 20 itens por página em ambas as abas.
  - Seleção múltipla por checkboxes individuais ou botão mestre ("Selecionar Todos" / "Desmarcar Todos").
  - **Seleção Global Multi-Página**: O botão "Selecionar Todos" seleciona globalmente todos os itens elegíveis do sistema em ambas as abas (mesmo os que estão em outras páginas), mantendo os itens marcados ao navegar pela paginação e exibindo o contador total exato de itens selecionados para exclusão em lote.
  - **Super Admin Sempre no Topo**: O Super Admin oficial permanece fixado no topo absoluto da listagem de usuários ativos em todas as visualizações e ordenações.
  - **Filtro por Tipo de Usuário**: Dropdown interativo na barra de ações que permite filtrar a listagem por Todas as Funções, Super Admin, Administrador (Admin) ou Usuário, recalculando automaticamente a paginação e a contagem de registros exibidos.
  - **Edição e Redefinição de Senha de Usuários Cadastrados**: 
    - Administradores e Usuários comuns possuem botão de edição individual que abre o modal `EditUserModal` para alteração exclusiva de nome, e-mail e função (Admin ou Usuário), sem campo para o administrador definir senha manualmente pelo usuário.
    - Ao lado do botão de editar informações na tabela de usuários (e também disponível no modal de edição), há o botão dedicado **"Redefinir senha"** (ícone de chave).
    - O acionamento abre um popup de confirmação centralizado (backdrop escuro, fechamento exclusivo via botões) que, após confirmação, gera um token seguro com validade de 24 horas (`PasswordResetToken`), dispara e-mail com link de redefinição via Brevo e exibe o link direto com botão de cópia rápida para a área de transferência.
    - O Super Admin é estritamente protegido, sem exibição dos botões de edição ou de redefinição de senha na interface e com bloqueio de segurança `HTTP 400` no backend caso haja tentativa de alteração.
  - Exclusão em lote protegida por modal centralizado à prova de cliques acidentais.
- [x] **Geração de Links de Convite**:
  - Links únicos protegidos por token (`secrets.token_urlsafe(32)`).
  - Opções de expiração em horas/dias: 1 hora, 6 horas, 24 horas, 48 horas e 7 dias.
  - Copiar o link não recarrega nem atualiza a tela; exibe toast no canto superior direito.
- [x] **Cadastro via Convite e Verificação Brevo**:
  - Tela pública em `/invite/:token` com popup centralizado e responsivo (sem cortes).
  - Validação de senha forte (mínimo 12 caracteres, maiúscula, minúscula, número e caractere especial).
  - Validação em 2 etapas com disparo de código de 6 dígitos via Brevo (e-mail).
  - Bloqueio rígido de e-mail duplicado: se o e-mail já pertencer a uma conta ativa, o sistema bloqueia e informa explicitamente o erro ao usuário.

---

## 9. Backup Automático e Armazenamento no Backblaze B2 (S3)
- [x] **Localização no Sidebar:** O botão "Backup Automático" fica posicionado **logo acima** do botão "Gestão de Usuário" e visível exclusivamente para o Super Admin.
- [x] **Provedor de Armazenamento:** Os dumps compactados (`.dump.gz`) do banco de dados PostgreSQL são armazenados no **Backblaze B2** utilizando o protocolo S3.
- [x] **Identidade Visual:** Segue a identidade visual padrão do VTurb (fundo claro `#f8fafc`, cartões brancos com sombras sutis, bordas elegantes e elementos em azul/vermelho).
- [x] **Abas do Painel de Backup:**
  1. **Backups no S3:** Cards de métricas (Último Backup, Próximo Backup recalculado dinamicamente, Retenção no S3); botão de backup manual imediato ("Fazer Backup Agora"); tabela de backups com seleção múltipla, paginação, download, restauração no banco e exclusão.
  2. **Agendamento Automático:** Ativar/desativar rotina automática, frequência (horas, dias, semanal) e intervalo (ex: 6 horas, 12 horas, 24 horas), pasta no bucket (ex: `vturb/backups/`) e retenção máxima. Ao salvar as configurações, o horário do próximo backup é recalculado imediatamente com base no intervalo escolhido.
  3. **Importar Backup Externo:** Permite envio de arquivos `.dump`, `.dump.gz` ou `.sql` externos diretamente para o Backblaze B2 com restauração guiada.
- [x] **Política de Retenção:** Ao atingir o limite máximo configurado (padrão: 30 backups), o sistema exclui automaticamente os backups mais antigos do S3 e do banco.
- [x] **Modo de Desenvolvimento:** Fallback local automático em `backend/backups/` quando as chaves S3 não estiverem configuradas.
- [x] **Feedback Visual de Backup Manual (Popup Centralizado):** Ao clicar em "Fazer Backup Agora", um popup modal centralizado com backdrop escuro translúcido (`BackupCreationModal`) é exibido imediatamente no centro da tela, apresentando título ("Criando Backup do Sistema"), status animado ("Processando PostgreSQL & S3"), barra de progresso indeterminada e bloqueio contra interações acidentais até a conclusão do processo.
- [x] **Diferenciação de Tipos de Backup na Listagem:** Backups manuais gerados pelo botão "Fazer Backup Agora" recebem obrigatoriamente o sufixo `_manual` em seu nome de arquivo (ex: `vturb_backup_YYYY_MM_DD_HH_MM_SS_manual.dump.gz`) e são exibidos com o badge azul **Manual**. Backups disparados pela rotina automática de agendamento recebem o sufixo `_auto` com badge amarelo **Automático**. Backups enviados de fora pelo usuário recebem o badge roxo **Importado** (`is_external: true`).


---

## 10. Persistência de Navegação, Tela Inicial e Categorização da Barra Lateral
- [x] **Tela Inicial Obrigatória no Login**: Toda vez que o usuário realizar login no sistema (primeiro acesso ou nova autenticação após logout/expiração), a aplicação é direcionada invariavelmente para a tela inicial **"Meus vídeos"**, garantindo consistência no ponto de partida do fluxo de trabalho.
- [x] Ao recarregar a página (F5 ou refresh do navegador) durante uma sessão já autenticada e ativa, a aplicação restaura automaticamente a última página/aba carregada (armazenada em `localStorage` com as chaves `vturb_current_tab`, `vturb_user_tab` e `vturb_backup_tab`), garantindo que o usuário nunca perca seu contexto de trabalho.
- [x] **Categorização Visual da Barra Lateral (Sidebar)**:
  - Os botões da barra lateral são organizados em duas categorias com rótulos em caixa alta e estilo discreto:
    1. **"GERAL"**: Agrupa as funções principais do dia a dia do usuário: **Meus vídeos** e **Central de Ajuda**.
    2. **"SEGURANÇA & ACESSO"**: Agrupa as funções sensíveis de administração: **Backup Automático** (exclusivo Super Admin) e **Gestão de Usuário** (Super Admin e Admin). Separada por uma divisória sutil superior e exibida apenas se o usuário logado tiver nível administrativo (Admin ou Super Admin). Usuários comuns (`role: 'user'`) não visualizam essa categoria nem seus itens.

---

## 11. Central de Ajuda & Tutoriais Integrados
- [x] **Nomenclatura Amigável para Usuário Comum**: Renomeada de "Documentação" para **"Central de Ajuda"** (com ícone amigável `HelpCircle`), evitando termos técnicos de programadores e facilitando a localização de tutoriais por usuários comuns e gestores de tráfego.
- [x] **Posicionamento no Menu Lateral**: O botão "Central de Ajuda" fica posicionado **logo abaixo do botão "Meus vídeos"** na barra lateral, acessível para todos os perfis autenticados.
- [x] **Ocultação da Barra Lateral Principal do Sistema**: Ao acessar a Central de Ajuda, a barra lateral principal do sistema é ocultada para liberar 100% da largura útil da interface. No topo da Central de Ajuda, é exibido o botão **"← Voltar para Meus Vídeos"**, que ao ser clicado redireciona para a lista de vídeos e restaura imediatamente a barra lateral principal.
- [x] **Menu Lateral de Tópicos Fixo com Scroll Isolado**: A lista lateral com os tópicos da Central de Ajuda permanece fixa e **nunca sai da tela** quando o usuário gira o scroll do mouse. A rolagem de leitura ocorre exclusivamente e de forma independente no painel de conteúdo à direita.
- [x] **Capturas Reais Ilustrativas (Screenshots) da Ferramenta**: Cada tópico da Central de Ajuda é ilustrado com prints reais capturados diretamente do sistema em funcionamento (`/help-screenshots/`), exibidos em molduras refinadas estilo navegador escuro com cantos arredondados, sombras suaves e legendas explicativas com ícone de câmera.
- [x] **Conteúdo Modular e Didático**: A Central de Ajuda é organizada em tópicos com passos sequenciais numerados, badges indicativos, caixas de dicas ("💡 Dica de Desempenho", "⚠️ Atenção"), exemplos práticos de código com botão de cópia rápida e botões de navegação "Anterior" e "Próximo".
- [x] **Ferramentas Documentadas**:
  1. *Primeiros Passos & Criação de Vídeos* (upload, formatos suportados e thumbnails).
  2. *Estilização & Personalização do Player* (cores, cantos arredondados, widescreen 16:9 vs vertical 9:16).
  3. *Modo Turbo* (aceleração de 0.5x a 2.0x com pitch correction para preservação do tom de voz).
  4. *Smart Autoplay & Desbloqueio de Som* (políticas anti-bloqueio e desbloqueio no primeiro clique).
  5. *Pitch Delay & Botão de Compra* (ocultar botões de checkout e sincronizar com `.delay-pitch`).
  6. *Player Flutuante* (Picture-in-Picture ao rolar a página).
  7. *Como Incorporar no seu Site* (guias para WordPress, Elementor, Shopify, ClickFunnels e HTML).
  8. *Métricas, Retenção & Rastreamento de Leads* (leitura da curva de retenção oficial VTurb e WhatsApp dos leads).
  9. *Gestão de Usuários & Convites* (funções de equipe e controle de acessos).
- [x] **Exclusão de Infraestrutura Interna**: A rotina técnica de Backup Automático no S3 é mantida fora da documentação pública para manter o foco exclusivo no uso comercial do player e conversão de VSL.
- [x] **Busca em Tempo Real**: Campo de pesquisa instantâneo que filtra por título, descrição, categoria ou passos, com tela de fallback amigável quando nenhum termo for encontrado.


