# Regras de Negócio - ProjetoVturb

Documento de referência para decisões de arquitetura e produto do ProjetoVturb.

---

## 1. Importação e Hospedagem de Vídeos
- [x] Cada vídeo cadastrado possui título, URL do vídeo, capa e opções visuais.
- [x] O upload inicial de vídeo aceita tanto arquivos locais (armazenados em static/uploads) quanto URLs diretas de CDN/S3/HLS, bem como upload de imagens para capas de thumbnail.
- [x] A criação/upload de novos vídeos é realizada em uma visualização de tela cheia dedicada (`VideoCreateView`) com a mesma identidade visual e estrutura de cabeçalho do editor de vídeos (`VideoDetailView`), substituindo popups ou modais antigos. Ao confirmar a criação com sucesso, a interface transiciona diretamente para o painel de edição do vídeo criado.
- [ ] [NOVO] Quais são as credenciais do Backblaze B2 (Key ID, Application Key, Bucket Name, Endpoint URL) ou se utilizaremos Cloudflare CDN como proxy de banda gratuita?

## 2. Código de Incorporação (Embedding)
- [x] O sistema deve gerar código iframe e script embed para que o usuário possa colar em qualquer landing page externa.
- [x] O embed permite personalizar largura máxima (presets 640px, 800px, 960px, 100% responsivo ou customizada) e proporção/altura (16:9, 9:16 vertical, 4:3 ou altura fixa em px).
- [x] A página do player em `/embed/:videoId` é independente e otimizada para carregamento ultra-rápido.
- [x] O player possui suporte nativo a botão de CTA dinâmico configurável com tempo de delay (pitch), link e texto customizados.

## 3. Métricas e Performance (Analytics)
- [x] O player embedado dispara eventos em tempo real (`impression`, `play`, `progress` em 25%, 50%, 75%, 100%, e `click`).
- [x] Prevenção de duplicação de impressões por duplo carregamento/StrictMode com flag de ciclo de vida.
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
- [x] Todo cálculo de data, filtros de período (Hoje, Ontem, etc.) e distribuição horária (00h às 23h) é obrigatoriamente referenciado no Horário Oficial de Brasília (BRT / UTC-3, fuso America/Sao_Paulo).

## 4. Recursos Avançados do Player (Modo Turbo)
- [x] O painel de gerenciamento do vídeo conta com a aba lateral "Turbo".
- [x] Possui switch de ativação dedicado ("Ativar Modo Turbo") no banner principal para ligar e desligar a aceleração a qualquer momento, atualizando o badge da barra lateral ("Ativo" / "Off").
- [x] Permite configurar a velocidade de reprodução do vídeo entre 0.5x (câmera lenta/mais devagar) até 2.0x (ultra-rápido/acelerado), com prévia ao vivo e ajuste fino.
- [x] O player embedado aplica nativamente a velocidade configurada (`playbackRate`) quando o Turbo está ativado, reproduzindo em velocidade normal (1.0x) caso desativado.

## 5. Gerenciamento e Exclusão em Massa de Vídeos
- [x] O usuário pode selecionar vídeos individualmente via checkbox ou selecionar todos os vídeos de uma só vez (checkbox mestre no topo da lista).
- [x] Ao selecionar um ou mais vídeos, é exibida uma barra de ações em lote destacando a quantidade de vídeos selecionados e o botão de exclusão em lote ("Excluir selecionados").
- [x] Toda ação de exclusão em massa requer confirmação prévia em um popup/modal centralizado com backdrop escuro transparente.
- [x] O popup de exclusão NÃO fecha ao clicar fora do painel central (fechamento apenas via botões "Cancelar" ou "Sim, Excluir"), garantindo a segurança contra exclusões acidentais.
- [x] A listagem de vídeos exibe no máximo 20 vídeos por página.
- [x] A listagem de vídeos exibe a data e o horário exato (hora e minuto) de criação/upload do vídeo formatados no padrão brasileiro (ex: "DD/MM/YYYY às HH:mm") referenciados no Horário Oficial de Brasília (America/Sao_Paulo).

## 6. Funcionalidades Avançadas do Player (Configuráveis por Vídeo na Barra Lateral)
- [x] Cada recurso avançado pode ser ativado ou desativado individualmente nas configurações de cada vídeo específico, com switches independentes e acesso dedicado na barra lateral de edição (9 abas no total).
- [x] **Smart Autoplay™**:
  - Inicia o vídeo de forma automática e mudo para contornar o bloqueio de autoplay dos navegadores modernos.
  - Exibe um banner/overlay chamativo com animação de som, texto customizável e botão com cor e texto personalizados para o espectador desmutar com 1 clique ("CLIQUE PARA OUVIR").
  - Opção configurável de reiniciar o vídeo do início (00:00) ao desmutar ou continuar do ponto onde estava tocando.
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
