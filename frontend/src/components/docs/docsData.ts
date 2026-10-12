import type { DocTopic } from './types'

export const DOC_TOPICS: DocTopic[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos & Criação de Vídeos',
    subtitle: 'Como adicionar seu primeiro vídeo na plataforma e configurar a capa',
    category: 'Comece Aqui',
    iconName: 'PlayCircle',
    badge: 'Essencial',
    summary: 'Aprenda a subir vídeos por arquivo MP4 ou URL externa de CDN e configurar uma thumbnail de alta conversão.',
    image: '/help-screenshots/primeiros-passos.png',
    imageCaption: 'Tela inicial do sistema: visualização rápida de vídeos, status e botão para novo upload.',
    secondaryImage: '/help-screenshots/video-create.png',
    secondaryImageCaption: 'Tela de criação de vídeo: faça upload do arquivo MP4 ou insira a URL direta do vídeo.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse o botão "+ Novo Vídeo"',
        description: 'No topo da tela inicial (Dashboard), clique no botão vermelho "+ Novo Vídeo" para abrir a tela de criação em modo imersivo.',
      },
      {
        stepNumber: 2,
        title: 'Escolha a fonte do vídeo',
        description: 'Você pode fazer upload direto de um arquivo MP4/WebM do seu computador ou colar o link direto de uma CDN/S3/HLS.',
        detail: 'Recomendamos vídeos codificados em H.264 (MP4) para garantir compatibilidade imediata com 100% dos navegadores desktop e mobile.',
      },
      {
        stepNumber: 3,
        title: 'Configure o Título e a Capa (Thumbnail)',
        description: 'Dê um nome claro para o vídeo e envie uma imagem de capa atraente no formato 16:9 ou 9:16.',
        detail: 'A imagem de capa é o primeiro elemento visual que o visitante vê antes do autoplay ou clique. Capas curiosas aumentam o Play Rate em até 35%.',
      },
      {
        stepNumber: 4,
        title: 'Salvar e Acessar o Painel de Edição',
        description: 'Clique em "Criar Vídeo". O sistema salvará o vídeo e abrirá automaticamente o editor completo com todas as abas de personalização.',
      },
    ],
    tips: [
      {
        type: 'tip',
        title: 'Dica de Desempenho',
        message: 'Para vídeos longos de VSL (mais de 20 minutos), utilize compressão adequada para manter o arquivo leve e permitir carregamento instantâneo mesmo no 4G/5G.',
      },
    ],
  },
  {
    id: 'estilizacao-player',
    title: 'Estilização & Personalização do Player',
    subtitle: 'Altere cores, controles, cantos arredondados e modos 16:9 vs 9:16',
    category: 'Design & Visual',
    iconName: 'Palette',
    badge: 'Customização',
    summary: 'Deixe o player com a identidade visual da sua marca, escolhendo entre cores de destaque, cantos arredondados e formato vertical ou widescreen.',
    image: '/help-screenshots/estilizacao-player.png',
    imageCaption: 'Painel de Estilização: proporção 16:9 widescreen vs 9:16 vertical, border radius e prévia ao vivo.',
    steps: [
      {
        stepNumber: 1,
        title: 'Abra a aba "Estilização" no menu lateral do vídeo',
        description: 'Dentro da edição do vídeo, clique em "Estilização" na barra lateral esquerda para acessar a prévia interativa ao vivo.',
      },
      {
        stepNumber: 2,
        title: 'Escolha a proporção (Aspect Ratio)',
        description: 'Alterne entre Widescreen (16:9) para páginas de vendas tradicionais ou Modo Vertical (9:16) para páginas no formato Reels/TikTok/Stories.',
      },
      {
        stepNumber: 3,
        title: 'Ajuste os Cantos Arredondados (Border Radius)',
        description: 'Use o controle deslizante para escolher o arredondamento das bordas do vídeo, entre 0px (reto) até 20px (curvatura suave moderna).',
      },
      {
        stepNumber: 4,
        title: 'Personalize os Controles Visuais',
        description: 'Ative ou desative elementos como barra de progresso, botão de fullscreen, volume vertical e contador regressivo de tempo restante.',
      },
    ],
    tips: [
      {
        type: 'tip',
        title: 'Conversão em Mobile',
        message: 'Para páginas com foco exclusivo em tráfego de Instagram Ads ou TikTok Ads, o formato 9:16 vertical preenche a tela do celular e retém mais atenção.',
      },
    ],
  },
  {
    id: 'modo-turbo',
    title: 'Modo Turbo (Aceleração Inteligente)',
    subtitle: 'Aumente a retenção acelerando o vídeo de forma natural sem distorcer o tom de voz',
    category: 'Mecânicas de Conversão',
    iconName: 'Zap',
    badge: 'Alta Conversão',
    summary: 'Acelere a reprodução da sua VSL (ex: 1.1x a 1.25x) para entregar a mensagem mais rápido sem que o visitante perceba que a voz está acelerada.',
    image: '/help-screenshots/modo-turbo.png',
    imageCaption: 'Modo Turbo: aceleração inteligente de vídeo sem distorcer o tom vocal da VSL.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse o submenu "Controles" > "Turbo"',
        description: 'Na barra lateral do editor do vídeo, clique em "Controles" para expandir as opções e selecione o item "Turbo".',
      },
      {
        stepNumber: 2,
        title: 'Ative a chave "Ativar Modo Turbo"',
        description: 'Ligue o switch principal. O status na barra lateral mudará para "Ativo" com destaque visual.',
      },
      {
        stepNumber: 3,
        title: 'Defina a Velocidade Desejada',
        description: 'Escolha entre os presets rápidos (1.1x, 1.2x, 1.25x) ou utilize o slider de precisão fina de 0.5x até 2.0x.',
        detail: 'O motor de áudio preserva o tom vocal natural (pitch correction), evitando o efeito "voz de esquilo".',
      },
      {
        stepNumber: 4,
        title: 'Salve as alterações',
        description: 'Clique em "Salvar Configurações". O player embutido no seu site passará a reproduzir na velocidade configurada instantaneamente.',
      },
    ],
    tips: [
      {
        type: 'info',
        title: 'Velocidade Ideal recomendada',
        message: 'Estudos de VSL comprovam que acelerações entre 1.10x e 1.15x aumentam o tempo médio assistido em até 22% sem que o ouvinte note alteração no ritmo de fala.',
      },
    ],
  },
  {
    id: 'smart-autoplay',
    title: 'Smart Autoplay & Desbloqueio de Som',
    subtitle: 'Supere o bloqueio automático dos navegadores e comece a rodar o vídeo imediatamente',
    category: 'Mecânicas de Conversão',
    iconName: 'Volume2',
    badge: 'Essencial',
    summary: 'O Smart Autoplay inicia o vídeo em modo mudo com uma chamada chamativa ("Clique para ouvir") e ativa o som no primeiro toque do visitante.',
    image: '/help-screenshots/smart-autoplay.png',
    imageCaption: 'Smart Autoplay: reprodução automática imediata com chamada personalizada para ativar o som.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse "Controles" > "Smart Autoplay"',
        description: 'No menu lateral do editor do vídeo, clique em "Controles" e selecione "Smart Autoplay".',
      },
      {
        stepNumber: 2,
        title: 'Configure o Botão de Ativação do Áudio',
        description: 'Personalize o texto da chamada (ex: "Seu vídeo já começou. Clique para ouvir!"), cor de destaque e animação pulsante.',
      },
      {
        stepNumber: 3,
        title: 'Desbloqueio de Primeiro Toque (Auto Unlock)',
        description: 'O script de incorporação inclui um ouvinte global que desmuta o áudio automaticamente no menor toque ou clique do usuário em qualquer ponto da página.',
      },
    ],
    tips: [
      {
        type: 'warning',
        title: 'Política de Navegadores',
        message: 'Navegadores como Safari (iPhone) e Chrome bloqueiam autoplay com som ativado por padrão. O Smart Autoplay garante que seu vídeo nunca fique travado.',
      },
    ],
  },
  {
    id: 'pitch-delay-cta',
    title: 'Pitch Delay & Botão de Compra (CTA Oculto)',
    subtitle: 'Revele o botão de compra na página no minuto e segundo exatos em que a oferta é feita',
    category: 'Mecânicas de Conversão',
    iconName: 'Clock',
    badge: 'Vendas',
    summary: 'Mantenha os botões de checkout e seções de preço ocultos até o momento do pitch para focar a atenção do lead 100% no conteúdo da VSL.',
    image: '/help-screenshots/pitch-delay-cta.png',
    imageCaption: 'Pitch Delay: configuração de tempo em minutos/segundos para liberação do botão de compra.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse a aba "Conteúdo Oculto" ou "Métricas"',
        description: 'No editor de vídeo, você pode definir o tempo do pitch em Minutos e Segundos (ex: 14 minutos e 30 segundos = 14:30).',
      },
      {
        stepNumber: 2,
        title: 'Adicione a classe no botão do seu site',
        description: 'No construtor da sua página (Elementor, Klickpages, WordPress, etc.), adicione a classe CSS delay-pitch no elemento ou seção que deve ficar oculta.',
      },
      {
        stepNumber: 3,
        title: 'Escolha se deseja rolagem automática (Auto-Scroll)',
        description: 'Ative o auto-scroll se desejar que a tela role suavemente até o botão assim que a oferta for liberada.',
      },
      {
        stepNumber: 4,
        title: 'Persistência para Visitantes Recorrentes',
        description: 'Com a persistência ativada, se o lead que já assistiu até o pitch recarregar a página, o botão aparecerá imediatamente para ele não precisar assistir tudo de novo.',
      },
    ],
    codeExample: {
      language: 'html',
      code: '<div class="delay-pitch" style="display: none;">\n  <a href="https://seulinkdecheckout.com" class="btn-comprar">\n    QUERO GARANTIR MINHA VAGA AGORA!\n  </a>\n</div>',
      caption: 'Exemplo de código HTML com a classe .delay-pitch adicionada no botão do site',
    },
    tips: [
      {
        type: 'tip',
        title: 'Sincronização Perfeita',
        message: 'Ao configurar o pitch, o sistema também cria automaticamente uma linha guia no gráfico de Métricas para você ver exatamente quantas pessoas chegaram na oferta.',
      },
    ],
  },
  {
    id: 'player-flutuante',
    title: 'Player Flutuante (Picture-in-Picture)',
    subtitle: 'Mantenha o vídeo visível no cantinho da tela enquanto o visitante lê o restante da página',
    category: 'Mecânicas de Conversão',
    iconName: 'Tv',
    badge: 'Engajamento',
    summary: 'Quando o lead rola a página para baixo e passa do vídeo, o player encolhe e flutua no canto da tela, mantendo a atenção mesmo durante o scroll.',
    image: '/help-screenshots/player-flutuante.png',
    imageCaption: 'Player Flutuante: mini-player flutuante Picture-in-Picture no canto da tela durante a rolagem.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse "Controles" > "Player Flutuante"',
        description: 'No editor do vídeo, selecione "Player Flutuante" dentro do submenu Controles.',
      },
      {
        stepNumber: 2,
        title: 'Ative a chave do Mini Player',
        description: 'Ligue o recurso para habilitar o comportamento de Picture-in-Picture automático.',
      },
      {
        stepNumber: 3,
        title: 'Escolha a Posição e a Largura',
        description: 'Defina onde o player deve flutuar (Canto inferior direito, inferior esquerdo, superior direito ou superior esquerdo) e a largura em pixels (padrão: 320px).',
      },
      {
        stepNumber: 4,
        title: 'Botão de Fechar',
        description: 'Você pode permitir que o visitante feche o mini-player clicando em um "X" discreto, se desejar.',
      },
    ],
  },
  {
    id: 'incorporacao-embed',
    title: 'Como Incorporar no seu Site (WordPress, Elementor, etc.)',
    subtitle: 'Copie o código uma única vez e incorpore em qualquer plataforma sem conflitos',
    category: 'Instalação & Integração',
    iconName: 'Code',
    badge: 'Instalação',
    summary: 'Como copiar e colar o código de incorporação universal do player no WordPress, Elementor, Shopify, ClickFunnels ou HTML puro.',
    image: '/help-screenshots/incorporacao-embed.png',
    imageCaption: 'Código de Incorporação: copie o script otimizado ou iframe para Elementor, WordPress e plataformas.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse a aba "Incorporação"',
        description: 'No editor de vídeo, clique na aba "Incorporação" na barra superior.',
      },
      {
        stepNumber: 2,
        title: 'Selecione a Largura e a Proporção',
        description: 'Escolha o preset de largura (640px, 800px, 960px ou 100% Responsivo) e o modo de visualização ("Apenas o Vídeo" ou "Fundo Preto Cinema").',
      },
      {
        stepNumber: 3,
        title: 'Escolha o tipo de código',
        description: 'Você pode escolher entre "Iframe Responsivo" (máxima compatibilidade com construtores visuais) ou "Widget / Script".',
      },
      {
        stepNumber: 4,
        title: 'Copie e cole no seu site',
        description: 'Clique no botão verde "Copiar". No Elementor/WordPress, adicione um bloco de "HTML Personalizado" e cole o código lá dentro.',
      },
    ],
    tips: [
      {
        type: 'info',
        title: 'Sincronização em Tempo Real',
        message: 'Você só precisa colar o código no seu site UMA ÚNICA VEZ. Sempre que mudar cores, pitch delay ou velocidade no painel, o site atualiza automaticamente sem você precisar mexer no código de novo!',
      },
    ],
  },
  {
    id: 'metricas-leads',
    title: 'Métricas, Retenção & Rastreamento de Leads (WhatsApp)',
    subtitle: 'Analise o gráfico oficial de retenção, taxa de cliques e contatos capturados',
    category: 'Analytics & Vendas',
    iconName: 'BarChart2',
    badge: 'Analytics',
    summary: 'Entenda os números por trás da sua VSL, descubra o minuto exato onde as pessoas abandonam o vídeo e veja quais contatos chegaram até a oferta.',
    image: '/help-screenshots/metricas-leads.png',
    imageCaption: 'Métricas & Retenção: curva de retenção segundo a segundo, taxa de reprodução e cliques no CTA.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse a aba "Métricas"',
        description: 'Abra a aba "Métricas" no editor do vídeo para visualizar os cards de resumo e gráficos.',
      },
      {
        stepNumber: 2,
        title: 'Entenda os Indicadores Principais',
        description: '• Impressões Únicas: Quantas pessoas reais carregaram a página.\n• Plays Únicos: Quantas pessoas assistiram ao vídeo.\n• Play Rate: A porcentagem de visitantes que deram play (meta ideal: > 60%).\n• Chegaram na Oferta: Quantos leads assistiram até o minuto do pitch.',
      },
      {
        stepNumber: 3,
        title: 'Analise a Curva de Retenção',
        description: 'Passe o mouse sobre o gráfico com curva verde neon para inspecionar segundo a segundo quantas pessoas ainda estavam assistindo naquele momento exato.',
      },
      {
        stepNumber: 4,
        title: 'Rastreamento de Leads na Sub-Aba "Contatos"',
        description: 'Se sua página enviar os dados do lead via URL (?name=...&phone=...) ou webhook, a sub-aba Contatos lista Nome, WhatsApp com link direto, tempo assistido e o selo "Chegou na Oferta".',
      },
    ],
    tips: [
      {
        type: 'tip',
        title: 'Recuperação de Vendas no 1 a 1',
        message: 'Clique no botão de WhatsApp do contato que chegou até a oferta mas não comprou para chamá-lo diretamente e tirar dúvidas no suporte.',
      },
    ],
  },
  {
    id: 'gestao-usuarios',
    title: 'Gestão de Usuários & Permissões de Equipe',
    subtitle: 'Como convidar membros da equipe, atribuir funções de Admin e gerenciar acessos',
    category: 'Administração',
    iconName: 'Users',
    badge: 'Equipe',
    summary: 'Permite que Super Admins e Administradores convidem gestores de tráfego, copywriters ou assistentes para gerenciar os vídeos com segurança.',
    image: '/help-screenshots/gestao-usuarios.png',
    imageCaption: 'Gestão de Usuários: controle de membros da equipe com papéis de Administrador e Usuário Comum.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acesse "Gestão de Usuário" no menu lateral',
        description: 'Clique no botão "Gestão de Usuário" na barra lateral (disponível para Super Admin e Administradores).',
      },
      {
        stepNumber: 2,
        title: 'Clique em "Criar Convite"',
        description: 'No topo da página de usuários, clique no botão para gerar um link de convite seguro.',
      },
      {
        stepNumber: 3,
        title: 'Selecione a Função e o Prazo de Expiração',
        description: 'Escolha a função: "Administrador (Admin)" com permissões de gestão ou "Usuário" para edição regular, e defina a validade do link (ex: 24h, 48h ou 7 dias).',
      },
      {
        stepNumber: 4,
        title: 'Envie o link para o membro da equipe',
        description: 'Copie o link gerado e envie para a pessoa. Ao abrir o link, ela criará sua senha com verificação de segurança.',
      },
    ],
    tips: [
      {
        type: 'warning',
        title: 'Proteção do Super Admin',
        message: 'O Super Admin oficial do sistema nunca pode ser excluído nem ter seu nível rebaixado, garantindo a integridade e propriedade definitiva da ferramenta.',
      },
    ],
  },
]
