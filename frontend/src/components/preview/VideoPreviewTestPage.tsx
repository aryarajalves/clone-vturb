import React, { useEffect, useState } from 'react'
import {
  ExternalLink,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Star,
  Play,
  Layers,
  Zap,
} from 'lucide-react'
import type { Video } from '../../types/video'
import { fetchVideo } from '../../services/api'

interface VideoPreviewTestPageProps {
  videoId: string
}

export const VideoPreviewTestPage: React.FC<VideoPreviewTestPageProps> = ({ videoId }) => {
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPitchReached, setIsPitchReached] = useState(false)

  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const rawRatio = queryParams.get('ratio') || '16:9'
  const rawWidth = queryParams.get('width') || '640px'
  const rawHeight = queryParams.get('height')
  const transparentParam = queryParams.get('transparent')
  const isTransparent = transparentParam !== null
    ? (transparentParam === '1' || transparentParam === 'true')
    : Boolean(video?.player_settings?.transparent_background ?? true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        setLoading(true)
        const data = await fetchVideo(videoId)
        if (isMounted) setVideo(data)
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Erro ao carregar dados do vídeo.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [videoId])

  const effectiveRatio = (rawRatio === '9:16' || rawRatio === '9-16' || rawRatio === '9/16')
    ? '9:16'
    : (rawRatio === '4:3' ? '4:3' : (rawRatio === 'custom' || rawHeight ? 'custom' : '16:9'))
  const paddingTop = rawHeight || effectiveRatio === 'custom'
    ? '0'
    : effectiveRatio === '9:16'
    ? '177.77%'
    : effectiveRatio === '4:3'
    ? '75%'
    : '56.25%'
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const embedSrc = `${origin}/?embed=${videoId}&ratio=${effectiveRatio}&width=${encodeURIComponent(rawWidth)}&transparent=${isTransparent ? '1' : '0'}${rawHeight ? `&height=${encodeURIComponent(rawHeight)}` : ''}`

  // Configuração do Player Flutuante e Pitch Delay no site de teste
  useEffect(() => {
    if (!video) return

    const floatingCfg = video.player_settings?.floating_player
    const isFloatingConfig = Boolean(floatingCfg?.enabled)
    const floatingPos = floatingCfg?.position || 'bottom-right'
    const floatingWidth = Number(floatingCfg?.width) || 320
    const isCloseable = floatingCfg?.closeable !== false

    let isFloatingDismissed = false
    let isCurrentlyFloating = false

    const wrapper = document.getElementById(`vturb-wrapper-${videoId}`)
    const ifr = document.querySelector<HTMLIFrameElement>(`iframe[src*="${videoId}"]`)
    if (!wrapper || !ifr) return

    // Botão de fechar da miniatura flutuante
    let closeBtn = document.getElementById(`vturb-close-floating-${videoId}`)
    if (!closeBtn && isCloseable) {
      const btn = document.createElement('button')
      btn.id = `vturb-close-floating-${videoId}`
      btn.innerHTML = '&#x2715;'
      btn.title = 'Fechar miniatura flutuante'
      btn.style.position = 'fixed'
      btn.style.zIndex = '100000'
      btn.style.width = '28px'
      btn.style.height = '28px'
      btn.style.borderRadius = '50%'
      btn.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'
      btn.style.border = '1px solid rgba(255, 255, 255, 0.3)'
      btn.style.color = '#ffffff'
      btn.style.cursor = 'pointer'
      btn.style.display = 'none'
      btn.style.alignItems = 'center'
      btn.style.justifyContent = 'center'
      btn.style.fontSize = '14px'
      btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)'
      btn.onclick = (ev) => {
        ev.stopPropagation()
        isFloatingDismissed = true
        updateFloatingState(false)
      }
      document.body.appendChild(btn)
      closeBtn = btn
    }

    function updateFloatingState(forceState?: boolean) {
      if (!wrapper || !ifr) return
      const shouldFloat =
        (typeof forceState === 'boolean' ? forceState : isCurrentlyFloating) &&
        isFloatingConfig &&
        !isFloatingDismissed
      isCurrentlyFloating = shouldFloat

      if (shouldFloat) {
        const isVertical = effectiveRatio === '9:16'
        const actualWidth = isVertical ? Math.min(floatingWidth, 250) : floatingWidth
        const floatHeight = isVertical ? Math.round((actualWidth * 16) / 9) : Math.round((actualWidth * 9) / 16)
        const marginEdge = 32, marginEdgeRight = 56
        ifr.style.position = 'fixed'
        ifr.style.top = 'auto'
        ifr.style.bottom = `${marginEdge}px`
        if (floatingPos === 'bottom-left') {
          ifr.style.left = `${marginEdge}px`
          ifr.style.right = 'auto'
        } else {
          ifr.style.right = `${marginEdgeRight}px`
          ifr.style.left = 'auto'
        }
        ifr.style.width = `${actualWidth}px`
        ifr.style.height = `${floatHeight}px`
        ifr.style.zIndex = '99999'
        ifr.style.backgroundColor = '#000000'
        ifr.style.borderRadius = '12px'
        ifr.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)'
        ifr.style.transition = 'box-shadow 0.2s ease, border-radius 0.2s ease'

        if (closeBtn) {
          closeBtn.style.display = 'flex'
          closeBtn.style.top = 'auto'
          closeBtn.style.bottom = `${marginEdge + floatHeight - 14}px`
          if (floatingPos === 'bottom-left') {
            closeBtn.style.left = `${marginEdge + actualWidth - 14}px`
            closeBtn.style.right = 'auto'
          } else {
            closeBtn.style.right = `${marginEdgeRight - 12}px`
            closeBtn.style.left = 'auto'
          }
        }
      } else {
        ifr.style.transition = 'none'
        ifr.style.position = 'absolute'
        ifr.style.top = '0'
        ifr.style.left = '0'
        ifr.style.right = 'auto'
        ifr.style.bottom = 'auto'
        ifr.style.width = '100%'
        ifr.style.height = '100%'
        ifr.style.zIndex = '1'
        ifr.style.borderRadius = `${video?.player_settings?.border_radius ?? 0}px`
        ifr.style.boxShadow = 'none'

        if (closeBtn) {
          closeBtn.style.display = 'none'
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rect = entry.boundingClientRect
          const pastTop = rect.bottom < 80
          if (!pastTop || entry.intersectionRatio > 0.35) isFloatingDismissed = false
          if (!isCurrentlyFloating) {
            if (pastTop && entry.intersectionRatio < 0.15) {
              updateFloatingState(true)
            }
          } else {
            if (!pastTop || entry.intersectionRatio > 0.35) {
              updateFloatingState(false)
            }
          }
        });
      },
      { threshold: [0, 0.1, 0.2, 0.35, 0.5] }
    )

    observer.observe(wrapper)

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'VTURB_PITCH_REACHED') {
        setIsPitchReached(true)
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      observer.disconnect()
      window.removeEventListener('message', handleMessage)
      if (closeBtn && closeBtn.parentNode) {
        closeBtn.parentNode.removeChild(closeBtn)
      }
    }
  }, [video, videoId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Carregando página de teste do Smart VSL...</span>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem' }}>
        <h2 style={{ color: '#f87171' }}>Não foi possível carregar a página de teste</h2>
        <p style={{ color: '#94a3b8' }}>{error || 'Vídeo não encontrado.'}</p>
        <a href="/" style={{ color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </a>
      </div>
    )
  }

  const pitchEnabled = Boolean(video.player_settings?.pitch_delay?.enabled)

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      {/* Barra Superior Fixa de Teste */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(10, 15, 29, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.85rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <ArrowLeft size={14} /> Painel
          </a>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Smart VSL <span style={{ color: '#818cf8', fontWeight: 500, fontSize: '0.8rem' }}>• Ambiente de Teste</span>
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Página de Teste Ativa
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
          <span>Dimensão: <strong style={{ color: '#fff' }}>{rawWidth}</strong> ({rawHeight ? `${rawHeight} fixa` : effectiveRatio}) {isTransparent ? '• Sem Fundo' : '• Cinema'}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            💡 Role a página para testar o player flutuante
          </span>
        </div>
      </header>

      {/* Conteúdo da Landing Page de Teste */}
      <main style={{ maxWidth: rawWidth === '100%' ? '100%' : '1000px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        {/* Seção Hero: Título VSL */}
        <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '0.35rem 0.85rem', borderRadius: '999px', color: '#a5b4fc', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <Sparkles size={14} /> Prévia Oficial de Conversão
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 1rem', color: '#ffffff' }}>
            {video.title || 'Apresentação Exclusiva em Vídeo'}
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Assista ao vídeo abaixo. Ao rolar para baixo para ler os detalhes da oferta, o player se transformará automaticamente em miniatura flutuante no canto inferior.
          </p>
        </section>

        {/* Player de Vídeo Incorporado */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div
            id={`vturb-wrapper-${video.id}`}
            data-testid="preview-test-wrapper"
            style={{
              maxWidth: rawWidth,
              width: '100%',
              height: rawHeight || 'auto',
              margin: '0 auto',
              position: 'relative',
              background: isTransparent ? 'transparent' : '#000000',
              borderRadius: `${video.player_settings?.border_radius ?? 12}px`,
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              height: rawHeight ? '100%' : 'auto',
              paddingTop: rawHeight ? 0 : paddingTop,
              background: isTransparent ? 'transparent' : '#000000',
            }}>
              <iframe
                src={embedSrc}
                data-testid="preview-test-iframe"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                  borderRadius: `${video.player_settings?.border_radius ?? 12}px`,
                  background: isTransparent ? 'transparent' : '#000000',
                }}
                allow="autoplay *; fullscreen *; encrypted-media *"
                allowFullScreen
              />
            </div>
          </div>

          {/* Botão de Pitch Delay (se configurado) */}
          {pitchEnabled && (
            <div
              className="delay-pitch"
              style={{
                display: isPitchReached ? 'block' : 'none',
                textAlign: 'center',
                marginTop: '2rem',
                animation: 'fadeIn 0.5s ease',
              }}
            >
              <button
                type="button"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  padding: '1rem 2.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                }}
              >
                🔥 QUERO GARANTIR MEU ACESSO AGORA!
              </button>
            </div>
          )}
        </section>

        {/* Indicador de Teste de Rolagem */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8))',
            border: '1px dashed rgba(99, 102, 241, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '4rem',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', marginBottom: '0.75rem' }}>
            <Layers size={24} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>
            Área de Teste do Player Flutuante
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            Role a tela para baixo. Conforme o vídeo acima sair da janela, a miniatura flutuará no canto inferior direito. Ao retornar para cima, o vídeo reassume seu espaço original suavemente.
          </p>
        </section>

        {/* Seção 1: Benefícios Estruturais */}
        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', margin: '0 0 2rem', color: '#fff' }}>
            Tecnologia de VSL Projetada para Máxima Conversão
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: Zap, title: 'Smart Autoplay™ com Áudio Transparente', desc: 'Permite que o vídeo inicie imediatamente sem perder o impacto inicial, superando as restrições de navegadores.' },
              { icon: Play, title: 'Modo Turbo com Aceleração Personalizada', desc: 'Acelere o ritmo da fala e da apresentação para aumentar a retenção do espectador até o momento da oferta.' },
              { icon: Layers, title: 'Mini-Player Flutuante (Picture-in-Picture)', desc: 'O visitante continua assistindo e ouvindo sua oferta mesmo enquanto rola para conferir os depoimentos e preços.' },
            ].map((card, i) => (
              <div key={i} style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <card.icon size={28} color="#818cf8" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#fff' }}>{card.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Seção 2: Texto Longo de Apresentação para Teste de Scroll */}
        <section style={{ background: '#090d1a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', padding: '2.5rem', marginBottom: '4rem', lineHeight: 1.8, color: '#cbd5e1' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: 0, marginBottom: '1.25rem' }}>
            Como os maiores players do mercado aumentam a retenção em mais de 37%
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Em uma página de vendas com VSL tradicional, o visitante médio rola a tela antes mesmo dos primeiros 2 minutos de vídeo para checar o preço ou os depoimentos. Quando isso ocorre em players comuns, o vídeo desaparece do campo de visão, a taxa de atenção despenca e a conversão final é seriamente prejudicada.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            Com o Smart VSL, o player acompanha a movimentação do usuário em uma miniatura flutuante de alta definição no canto inferior da tela. O áudio segue perfeitamente sincronizado e o visitante não perde nenhuma palavra do pitch de vendas.
          </p>
          <p style={{ margin: 0 }}>
            Além disso, os tempos de carregamento instantâneos e a eliminação de qualquer tela branca garantem que 100% dos cliques em anúncios sejam convertidos em visualizações reais.
          </p>
        </section>

        {/* Seção 3: Depoimentos Fictícios */}
        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, textAlign: 'center', margin: '0 0 2rem', color: '#fff' }}>
            O Que Nossos Clientes Dizem
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Ricardo Mendes', role: 'Gestor de Tráfego Direto', text: 'O player flutuante no canto da tela dobrou o tempo médio de visualização da nossa VSL vertical!' },
              { name: 'Juliana Costa', role: 'Infoprodutora de Alta Escala', text: 'Zero telas brancas e carregamento imediato. É a ferramenta mais profissional que já integrei às minhas páginas.' },
              { name: 'Marcos Silveira', role: 'Copywriter & Estrategista', text: 'O Smart Autoplay fez os testes de criativos responderem com muito mais força no tráfego frio.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.5 }}>
                  "{item.text}"
                </p>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seção 4: Garantia */}
        <section style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.03))', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>
          <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>Garantia Incondicional de 7 Dias</h3>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Demonstração de estabilidade e segurança. Esta página simula um ambiente de vendas completo para teste de scroll e comportamento do player.
          </p>
        </section>

        {/* Rodapé da Página */}
        <footer style={{ textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '2.5rem', color: '#64748b', fontSize: '0.8rem' }}>
          <p style={{ margin: '0 0 0.5rem' }}>Smart VSL • Todos os direitos reservados.</p>
          <p style={{ margin: 0 }}>Página de teste gerada para validação ao vivo de recursos do player.</p>
        </footer>
      </main>
    </div>
  )
}
