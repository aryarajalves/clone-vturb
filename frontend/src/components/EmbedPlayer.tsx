import React, { useEffect, useRef, useState } from 'react'
import { Play, Volume2, VolumeX, ExternalLink, ShieldAlert, X } from 'lucide-react'
import type { Video } from '../types/video'
import { fetchVideo, sendTelemetryEvent, getMediaUrl } from '../services/api'
import { SmartAutoplayOverlay } from './SmartAutoplayOverlay'

interface EmbedPlayerProps {
  videoId: string
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ videoId }) => {
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [domainBlocked, setDomainBlocked] = useState(false)
  const [isSmartAutoplaying, setIsSmartAutoplaying] = useState(false)
  const [isFloating, setIsFloating] = useState(false)
  const [floatingDismissed, setFloatingDismissed] = useState(false)

  const [visitorId] = useState(() => {
    try {
      let id = localStorage.getItem('vturb_visitor_id')
      if (!id) {
        id = 'vis_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36)
        localStorage.setItem('vturb_visitor_id', id)
      }
      return id
    } catch {
      return 'vis_' + Math.random().toString(36).substring(2, 9)
    }
  })

  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const progressSent = useRef<{ [key: string]: boolean }>({})
  const pixelEventsSent = useRef<{ [key: string]: boolean }>({})
  const pitchDelaySent = useRef(false)
  const impressionSent = useRef(false)

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const data = await fetchVideo(videoId)
        setVideo(data)

        // Previne envio duplicado de impressão em React StrictMode / duplo mount
        if (!impressionSent.current) {
          impressionSent.current = true
          sendTelemetryEvent(videoId, {
            event_type: 'impression',
            session_id: visitorId,
            referer: document.referrer || window.location.href,
          })
        }
      } catch (err: any) {
        setError('Vídeo indisponível ou excluído.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [videoId, visitorId])

  // Verificação de Whitelist e Proteção de Domínio
  useEffect(() => {
    if (!video) return
    const protection = video.player_settings?.domain_protection
    if (protection?.enabled && protection.allowed_domains && protection.allowed_domains.length > 0) {
      let host = ''
      try {
        if (document.referrer) {
          host = new URL(document.referrer).hostname.toLowerCase()
        } else {
          host = window.location.hostname.toLowerCase()
        }
      } catch {
        host = window.location.hostname.toLowerCase()
      }

      const isAllowed = protection.allowed_domains.some((d) => {
        const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
        if (!clean) return false
        return (
          clean === '*' ||
          host === clean ||
          host.endsWith('.' + clean) ||
          (clean === 'localhost' && (host === 'localhost' || host === '127.0.0.1'))
        )
      })

      setDomainBlocked(!isAllowed)
    } else {
      setDomainBlocked(false)
    }
  }, [video])

  // Aplica velocidade Turbo configurada no vídeo se turbo_enabled for true
  useEffect(() => {
    if (videoRef.current) {
      const isTurbo = Boolean(video?.player_settings?.turbo_enabled)
      const rate = Number(video?.player_settings?.playback_rate) || 1.0
      videoRef.current.playbackRate = isTurbo ? rate : 1.0
    }
  }, [video])

  // Inicializa Smart Autoplay se ativado
  useEffect(() => {
    if (!video) return
    const smart = video.player_settings?.smart_autoplay
    if (smart?.enabled) {
      setIsSmartAutoplaying(true)
      setIsMuted(true)
      if (videoRef.current) {
        videoRef.current.muted = true
        try {
          const p = videoRef.current.play()
          if (p && typeof p.then === 'function') {
            p.then(() => setIsPlaying(true)).catch(() => {})
          } else {
            setIsPlaying(true)
          }
        } catch {}
      }
    }
  }, [video])

  // Observer para Player Flutuante (Picture-in-Picture)
  useEffect(() => {
    const floating = video?.player_settings?.floating_player
    if (!floating?.enabled || floatingDismissed || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloating(!entry.isIntersecting)
      },
      { threshold: 0.15 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [video, floatingDismissed])

  // Disparo de eventos de Pixels de Rastreamento
  const dispatchPixelEvent = (triggerKey: 'percent_25' | 'percent_50' | 'percent_75' | 'percent_100' | 'pitch') => {
    if (pixelEventsSent.current[triggerKey]) return
    pixelEventsSent.current[triggerKey] = true

    const tracking = video?.player_settings?.tracking_pixels
    if (!tracking?.enabled) return

    const eventConfig = tracking.events?.find((e) => e.trigger === triggerKey)
    if (eventConfig && !eventConfig.enabled) return
    const eventName = eventConfig?.event_name || triggerKey

    const payload = {
      type: 'VTURB_PIXEL_TRACK',
      trigger: triggerKey,
      eventName,
      videoId,
      trackingPixels: tracking,
    }

    if (typeof window !== 'undefined') {
      window.parent?.postMessage(payload, '*')
      window.postMessage(payload, '*')

      const w = window as any
      if (typeof w.fbq === 'function') {
        w.fbq('trackCustom', eventName, { video_id: videoId })
      }
      if (typeof w.gtag === 'function') {
        w.gtag('event', eventName, { video_id: videoId })
      }
      if (typeof w.ttq === 'function' && typeof w.ttq.track === 'function') {
        w.ttq.track(eventName, { video_id: videoId })
      }
    }
  }

  const handlePlay = () => {
    if (videoRef.current) {
      if (video?.player_settings?.playback_rate) {
        videoRef.current.playbackRate = Number(video.player_settings.playback_rate) || 1.0
      }
      try {
        const p = videoRef.current.play()
        if (p && typeof p.catch === 'function') {
          p.catch(() => {})
        }
      } catch {}
      setIsPlaying(true)
      sendTelemetryEvent(videoId, {
        event_type: 'play',
        session_id: visitorId,
      })
    }
  }

  const handleSmartAutoplayUnmute = () => {
    if (!videoRef.current) return
    const smart = video?.player_settings?.smart_autoplay
    videoRef.current.muted = false
    setIsMuted(false)
    if (smart?.restart_on_unmute) {
      videoRef.current.currentTime = 0
    }
    try {
      const p = videoRef.current.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {})
      }
    } catch {}
    setIsPlaying(true)
    setIsSmartAutoplaying(false)
    sendTelemetryEvent(videoId, {
      event_type: 'play',
      session_id: visitorId,
    })
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current || !video) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration || video.duration

    if (total > 0) {
      const pct = (current / total) * 100

      if (pct >= 25 && !progressSent.current['25']) {
        progressSent.current['25'] = true
        sendTelemetryEvent(videoId, { event_type: 'progress_25', watch_time_seconds: current, session_id: visitorId })
        dispatchPixelEvent('percent_25')
      }
      if (pct >= 50 && !progressSent.current['50']) {
        progressSent.current['50'] = true
        sendTelemetryEvent(videoId, { event_type: 'progress_50', watch_time_seconds: current, session_id: visitorId })
        dispatchPixelEvent('percent_50')
      }
      if (pct >= 75 && !progressSent.current['75']) {
        progressSent.current['75'] = true
        sendTelemetryEvent(videoId, { event_type: 'progress_75', watch_time_seconds: current, session_id: visitorId })
        dispatchPixelEvent('percent_75')
      }
    }

    // Gatilho de Pitch Delay (Conteúdo Oculto)
    if (video.player_settings?.pitch_delay?.enabled && !pitchDelaySent.current) {
      const pitchSeconds = video.player_settings.pitch_delay.time || 60
      if (current >= pitchSeconds) {
        pitchDelaySent.current = true
        dispatchPixelEvent('pitch')
        const payload = {
          type: 'VTURB_PITCH_REACHED',
          videoId,
          targetSelector: video.player_settings.pitch_delay.target_css_selector || '.delay-pitch',
          autoScroll: video.player_settings.pitch_delay.auto_scroll ?? true,
          scrollOffset: video.player_settings.pitch_delay.scroll_offset || 50,
          persistence: video.player_settings.pitch_delay.persistence ?? true,
        }
        if (typeof window !== 'undefined') {
          window.parent?.postMessage(payload, '*')
          window.postMessage(payload, '*')
          try {
            const el = document.querySelector(payload.targetSelector)
            if (el) (el as HTMLElement).style.display = 'block'
          } catch {}
        }
      }
    }

    // Verifica delay do botão de CTA
    if (video.player_settings?.cta_enabled) {
      if (current >= video.player_settings.cta_time && !showCta) {
        setShowCta(true)
      }
    }
  }

  const handleEnded = () => {
    if (!progressSent.current['100']) {
      progressSent.current['100'] = true
      sendTelemetryEvent(videoId, {
        event_type: 'progress_100',
        watch_time_seconds: videoRef.current?.duration || 0,
        session_id: visitorId,
      })
      dispatchPixelEvent('percent_100')
    }
  }

  const handleCtaClick = () => {
    sendTelemetryEvent(videoId, {
      event_type: 'click',
      session_id: visitorId,
    })
  }

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '300px', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
        Carregando player...
      </div>
    )
  }

  if (error || !video) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '300px', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', padding: '1rem' }}>
        {error || 'Vídeo não encontrado'}
      </div>
    )
  }

  if (domainBlocked) {
    return (
      <div
        data-testid="domain-blocked-view"
        style={{
          width: '100%', height: '100%', minHeight: '300px', background: '#0a0a0f',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#ef4444', padding: '2rem', textAlign: 'center', boxSizing: 'border-box',
        }}
      >
        <ShieldAlert size={56} style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          Reprodução Não Autorizada
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.5, margin: 0 }}>
          Este vídeo possui proteção de domínio ativada e não tem autorização para ser reproduzido neste site.
        </p>
      </div>
    )
  }

  const primaryColor = video.player_settings?.primary_color || '#6366f1'
  const floatingConfig = video.player_settings?.floating_player
  const isFloatingActive = isFloating && !floatingDismissed && Boolean(floatingConfig?.enabled)
  const antiDownloadActive = video.player_settings?.domain_protection?.anti_download !== false

  return (
    <div
      ref={containerRef}
      data-testid="vturb-embed-player"
      onContextMenu={(e) => { if (antiDownloadActive) e.preventDefault() }}
      style={{
        position: isFloatingActive ? 'fixed' : 'relative',
        bottom: isFloatingActive ? '24px' : undefined,
        right: isFloatingActive ? (floatingConfig?.position === 'bottom-left' ? undefined : '24px') : undefined,
        left: isFloatingActive ? (floatingConfig?.position === 'bottom-left' ? '24px' : undefined) : undefined,
        width: isFloatingActive ? `${floatingConfig?.width || 320}px` : '100%',
        maxWidth: isFloatingActive ? undefined : (video.player_settings?.aspect_ratio === '9:16' ? '450px' : '100%'),
        aspectRatio: isFloatingActive ? undefined : (video.player_settings?.aspect_ratio === '9:16' ? '9/16' : undefined),
        margin: isFloatingActive ? undefined : '0 auto',
        height: isFloatingActive ? 'auto' : '100%',
        minHeight: isFloatingActive ? '180px' : '100%',
        maxHeight: isFloatingActive ? '240px' : undefined,
        zIndex: isFloatingActive ? 9999 : 1,
        borderRadius: isFloatingActive ? '16px' : `${video.player_settings?.border_radius ?? 0}px`,
        boxShadow: isFloatingActive ? '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 0 2px rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Botão de Fechar Mini-Player Flutuante */}
      {isFloatingActive && floatingConfig?.closeable !== false && (
        <button
          data-testid="floating-player-close"
          onClick={() => setFloatingDismissed(true)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20,
          }}
          title="Fechar player flutuante"
        >
          <X size={16} />
        </button>
      )}

      <video
        ref={videoRef}
        src={getMediaUrl(video.video_url)}
        poster={getMediaUrl(video.thumbnail_url)}
        controls={isPlaying && video.player_settings?.show_controls}
        controlsList={antiDownloadActive ? 'nodownload' : undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        playsInline
      />

      {/* Smart Autoplay™ Overlay */}
      {isSmartAutoplaying && (
        <SmartAutoplayOverlay
          settings={video.player_settings?.smart_autoplay}
          onUnmute={handleSmartAutoplayUnmute}
        />
      )}

      {/* Botão de Play Inteligente (Overlay Padrão) */}
      {!isPlaying && !isSmartAutoplaying && (() => {
        const playShape = video.player_settings?.play_button_shape || 'circle'
        const playSize = video.player_settings?.play_button_size || 'medium'
        const sizePx = playSize === 'small' ? 56 : playSize === 'large' ? 104 : 80
        const iconPx = playSize === 'small' ? 26 : playSize === 'large' ? 50 : 38
        const borderRadius =
          playShape === 'rounded'
            ? '18px'
            : playShape === 'square'
            ? '8px'
            : '50%'
        const buttonBg = playShape === 'minimal' ? 'rgba(10, 12, 18, 0.75)' : primaryColor
        const buttonBorder = playShape === 'minimal' ? `3px solid ${primaryColor}` : 'none'

        return (
          <div
            data-testid="big-play-overlay"
            onClick={handlePlay}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              data-testid="big-play-button"
              style={{
                width: `${sizePx}px`,
                height: `${sizePx}px`,
                borderRadius,
                background: buttonBg,
                border: buttonBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 35px ${primaryColor}99`,
                transition: 'transform 0.2s',
              }}
            >
              <Play size={iconPx} color="#fff" style={{ marginLeft: '4px' }} />
            </div>
          </div>
        )
      })()}

      {/* Botão de CTA com delay */}
      {showCta && video.player_settings?.cta_enabled && (
        <div
          data-testid="cta-button-container"
          style={{
            position: 'absolute',
            bottom: '24px',
            zIndex: 10,
            animation: 'fadeInUp 0.5s ease',
          }}
        >
          <a
            href={video.player_settings.cta_link}
            target="_top"
            onClick={handleCtaClick}
            data-testid="cta-button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 1.8rem', borderRadius: '50px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}
          >
            {video.player_settings.cta_text || 'Quero Comprar Agora'}
            <ExternalLink size={18} />
          </a>
        </div>
      )}
    </div>
  )
}
