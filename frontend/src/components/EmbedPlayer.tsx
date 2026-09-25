import React, { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, ExternalLink, ShieldAlert, X } from 'lucide-react'
import type { Video } from '../types/video'
import { fetchVideo, sendTelemetryEvent, getMediaUrl } from '../services/api'
import { SmartAutoplayOverlay } from './SmartAutoplayOverlay'
import { BigPlayOverlay } from './BigPlayOverlay'
import { DirectUnmuteBanner } from './DirectUnmuteBanner'
import { CustomPlayerControls } from './CustomPlayerControls'
import { CtaButtonOverlay } from './CtaButtonOverlay'
import { triggerTrackingPixels } from '../utils/embedTracking'
import { useAutoplay } from '../hooks/useAutoplay'
import { useDomainProtection } from '../hooks/useDomainProtection'
import { useVideoTelemetry } from '../hooks/useVideoTelemetry'
import { EmbedLoadingState, EmbedErrorState, EmbedBlockedState } from './EmbedPlayerStates'

interface EmbedPlayerProps {
  videoId: string
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ videoId }) => {
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true), [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false), [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(1.0), [showCta, setShowCta] = useState(false)
  const domainBlocked = useDomainProtection(video)
  const [isSmartAutoplaying, setIsSmartAutoplaying] = useState(false), [showDirectUnmuteBanner, setShowDirectUnmuteBanner] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false), [isFloating, setIsFloating] = useState(false), [floatingDismissed, setFloatingDismissed] = useState(false)
  const [currentTime, setCurrentTime] = useState(0), [duration, setDuration] = useState(0), [currentSpeed, setCurrentSpeed] = useState(1.0)
  const [areControlsVisible, setAreControlsVisible] = useState(true), [isFullscreen, setIsFullscreen] = useState(false)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const { trackImpression, handleTimeUpdateProgress, handleEndedTelemetry } = useVideoTelemetry({
    video,
    videoId,
    visitorId,
    setShowCta,
  })

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const data = await fetchVideo(videoId)
        setVideo(data)
        trackImpression()
      } catch (err: any) {
        setError('Vídeo indisponível ou excluído.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [videoId, visitorId])

  // Aplica velocidade Turbo configurada no vídeo se turbo_enabled for true
  useEffect(() => {
    if (videoRef.current) {
      const isTurbo = Boolean(video?.player_settings?.turbo_enabled)
      const rate = Number(video?.player_settings?.playback_rate) || 1.0
      videoRef.current.playbackRate = isTurbo ? rate : 1.0
    }
  }, [video])

  // Inicializa Autoplay (Smart Autoplay com chamada ou Autoplay Direto com som) via Hook customizado
  useAutoplay({
    video,
    videoId,
    visitorId,
    videoRef,
    setIsPlaying,
    setIsMuted,
    setIsSmartAutoplaying,
    setShowDirectUnmuteBanner,
  })

  const isInsideIframe = typeof window !== 'undefined' && window !== window.top

  // Observer para Player Flutuante interno e notificação do estado para janela mãe (site externo)
  useEffect(() => {
    try {
      window.parent?.postMessage({ type: 'VTURB_PLAY_STATE', isPlaying, videoId }, '*')
    } catch {}
  }, [isPlaying, videoId])

  useEffect(() => {
    const floating = video?.player_settings?.floating_player
    if (!floating?.enabled || floatingDismissed || !containerRef.current || isInsideIframe) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloating(!entry.isIntersecting)
      },
      { threshold: 0.15 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [video, floatingDismissed, isInsideIframe])

  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const rawRatio = queryParams.get('ratio') || queryParams.get('aspect_ratio')
  const effectiveRatio = (rawRatio === '9:16' || rawRatio === '9-16' || rawRatio === '9/16')
    ? '9:16'
    : (rawRatio === '4:3' ? '4:3' : (rawRatio === '16:9' ? '16:9' : video?.player_settings?.aspect_ratio || '16:9'))
  const configuredWidth = queryParams.get('width') || queryParams.get('max_width') || video?.player_settings?.default_width

  const isTransparent = isInsideIframe && Boolean(
    video?.player_settings?.transparent_background ||
    queryParams.get('transparent') === '1' ||
    queryParams.get('transparent') === 'true'
  )

  // Ativa transparência somente após o primeiro frame real do vídeo estar pintado na tela
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    let cancelled = false
    const onFramePainted = () => {
      if (!cancelled) setIsVideoReady(true)
    }

    if ('requestVideoFrameCallback' in el && typeof (el as any).requestVideoFrameCallback === 'function') {
      (el as any).requestVideoFrameCallback(() => onFramePainted())
    }

    const onPlaying = () => {
      requestAnimationFrame(() => {
        if (el.currentTime > 0 || el.readyState >= 3) onFramePainted()
      })
    }

    el.addEventListener('playing', onPlaying)
    return () => {
      cancelled = true
      el.removeEventListener('playing', onPlaying)
    }
  }, [video])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isTransparent && isVideoReady) {
        document.documentElement.classList.add('transparent-bg')
        document.body.classList.add('transparent-bg')
      } else {
        document.documentElement.classList.remove('transparent-bg')
        document.body.classList.remove('transparent-bg')
      }
    }
  }, [isTransparent, isVideoReady])

  const handleTimeUpdate = () => {
    if (!videoRef.current || !video) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration || video.duration || 0
    setCurrentTime(current)
    if (total > 0 && total !== duration) setDuration(total)
    if (current > 0.05 && !isVideoReady) setIsVideoReady(true)
    handleTimeUpdateProgress(current, total)
  }

  const handlePlay = () => {
    if (videoRef.current) {
      if (video?.player_settings?.playback_rate) {
        videoRef.current.playbackRate = Number(video.player_settings.playback_rate) || 1.0
      }
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
      sendTelemetryEvent(videoId, { event_type: 'play', session_id: visitorId })
    }
  }

  const handleSmartAutoplayUnmute = () => {
    if (!videoRef.current) return
    const smart = video?.player_settings?.smart_autoplay
    videoRef.current.muted = false
    setIsMuted(false)
    if (smart?.restart_on_unmute) videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
    setIsPlaying(true)
    setIsSmartAutoplaying(false)
    sendTelemetryEvent(videoId, { event_type: 'play', session_id: visitorId })
  }

  const handleTogglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      sendTelemetryEvent(videoId, { event_type: 'play', session_id: visitorId })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleToggleMute = () => {
    if (!videoRef.current) return
    const next = !videoRef.current.muted
    videoRef.current.muted = next
    setIsMuted(next)
    if (!next && videoRef.current.volume === 0) {
      videoRef.current.volume = 1.0
      setVolumeLevel(1.0)
    }
  }

  const handleVolumeChange = (newVal: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = newVal
    setVolumeLevel(newVal)
    if (newVal === 0) {
      videoRef.current.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
    }
  }

  const handleRewind10 = () => {
    if (!videoRef.current) return
    const next = Math.max(0, videoRef.current.currentTime - 10)
    videoRef.current.currentTime = next
    setCurrentTime(next)
  }

  const handleForward10 = () => {
    if (!videoRef.current) return
    const maxDur = duration || video?.duration || 60
    const next = Math.min(maxDur, videoRef.current.currentTime + 10)
    videoRef.current.currentTime = next
    setCurrentTime(next)
  }

  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = seconds
    setCurrentTime(seconds)
  }

  const handleCycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0]
    const next = speeds[(speeds.indexOf(currentSpeed) + 1) % speeds.length]
    setCurrentSpeed(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const resetControlsVisibilityTimeout = () => {
    setAreControlsVisible(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setAreControlsVisible(false)
    }, 3500)
  }

  const handleEnded = () => handleEndedTelemetry(videoRef.current?.duration || 0)
  const handleCtaClick = () => sendTelemetryEvent(videoId, { event_type: 'click', session_id: visitorId })

  if (loading) return <EmbedLoadingState />
  if (error || !video) return <EmbedErrorState error={error} />
  if (domainBlocked) return <EmbedBlockedState />

  const primaryColor = video.player_settings?.primary_color || '#6366f1'
  const floatingConfig = video.player_settings?.floating_player
  const isFloatingActive = !isInsideIframe && isFloating && !floatingDismissed && Boolean(floatingConfig?.enabled)
  const antiDownloadActive = video.player_settings?.domain_protection?.anti_download !== false

  return (
    <div
      ref={containerRef}
      data-testid="vturb-embed-player"
      onContextMenu={(e) => { if (antiDownloadActive) e.preventDefault() }}
      onMouseEnter={resetControlsVisibilityTimeout}
      onMouseMove={resetControlsVisibilityTimeout}
      onMouseLeave={() => { if (isPlaying) setAreControlsVisible(false) }}
      style={{
        position: isFloatingActive ? 'fixed' : 'relative',
        bottom: isFloatingActive ? '24px' : undefined,
        right: isFloatingActive ? (floatingConfig?.position === 'bottom-left' ? undefined : '24px') : undefined,
        left: isFloatingActive ? (floatingConfig?.position === 'bottom-left' ? '24px' : undefined) : undefined,
        width: isFullscreen ? '100vw' : isFloatingActive ? `${floatingConfig?.width || 320}px` : '100%',
        maxWidth: isFullscreen ? 'none' : isFloatingActive ? undefined : !isInsideIframe ? (configuredWidth ? (configuredWidth.endsWith('px') || configuredWidth.endsWith('%') ? configuredWidth : `${configuredWidth}px`) : (effectiveRatio === '9:16' ? '450px' : '100%')) : '100%',
        aspectRatio: isFullscreen ? undefined : isFloatingActive ? '16/9' : (isInsideIframe ? undefined : (effectiveRatio === '9:16' ? '9/16' : effectiveRatio === '4:3' ? '4/3' : undefined)),
        margin: isFloatingActive ? undefined : '0 auto',
        height: isFullscreen ? '100vh' : isFloatingActive ? `${Math.round((floatingConfig?.width || 320) * 9 / 16)}px` : '100%',
        minHeight: isFullscreen ? '100vh' : isFloatingActive ? `${Math.round((floatingConfig?.width || 320) * 9 / 16)}px` : '100%',
        maxHeight: isFullscreen ? 'none' : isFloatingActive ? `${Math.round((floatingConfig?.width || 320) * 9 / 16)}px` : (!isInsideIframe && effectiveRatio === '9:16' ? '92vh' : undefined),
        zIndex: isFloatingActive ? 9999 : 1,
        borderRadius: isFullscreen ? '0px' : isFloatingActive ? '16px' : `${video.player_settings?.border_radius ?? 0}px`,
        boxShadow: isFloatingActive && !isFullscreen ? '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 0 2px rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: isFullscreen ? '#000000' : isTransparent && isVideoReady ? 'transparent' : '#000000',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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

      {/* Indicador suave de carregamento nos primeiros segundos até o primeiro frame estar pronto */}
      {!isVideoReady && (
        <div
          data-testid="embed-buffering-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(255, 255, 255, 0.12)',
              borderTopColor: primaryColor,
              borderRadius: '50%',
              animation: 'spin 0.75s linear infinite',
            }}
          />
        </div>
      )}

      <video
        ref={videoRef}
        src={getMediaUrl(video.video_url)}
        poster={getMediaUrl(video.thumbnail_url)}
        controls={false}
        controlsList={antiDownloadActive ? 'nodownload' : undefined}
        preload="auto"
        onLoadedData={() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            requestAnimationFrame(() => setIsVideoReady(true))
          }
        }}
        onCanPlay={() => {
          if (videoRef.current && videoRef.current.readyState >= 3) {
            setIsVideoReady(true)
          }
        }}
        onPlaying={() => {
          requestAnimationFrame(() => setIsVideoReady(true))
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={handleTogglePlay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: isFullscreen ? 'contain' : (video.player_settings?.fit_mode || 'contain'),
          cursor: 'pointer',
          backgroundColor: isFullscreen ? '#000000' : isTransparent && isVideoReady ? 'transparent' : '#000000',
        }}
        playsInline
      />

      {/* Barra de Controles Personalizada do Player (Respeita controles visuais e show_controls) */}
      {video.player_settings?.show_controls !== false && (isPlaying || areControlsVisible) && !isSmartAutoplaying && (
        <div
          style={{
            opacity: isPlaying && !areControlsVisible ? 0 : 1,
            pointerEvents: isPlaying && !areControlsVisible ? 'none' : 'auto',
            transition: 'opacity 0.25s ease',
          }}
        >
          <CustomPlayerControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            volumeLevel={volumeLevel}
            currentTime={currentTime}
            duration={duration || video.duration || 60}
            currentSpeed={currentSpeed}
            primaryColor={primaryColor}
            controlsConfig={video.player_settings?.controls_config || undefined}
            chapters={video.player_settings?.chapters || undefined}
            onTogglePlay={handleTogglePlay}
            onToggleMute={handleToggleMute}
            onVolumeChange={handleVolumeChange}
            onRewind10={handleRewind10}
            onForward10={handleForward10}
            onCycleSpeed={handleCycleSpeed}
            onToggleFullscreen={handleToggleFullscreen}
            onSeek={handleSeek}
          />
        </div>
      )}

      {/* Smart Autoplay™ Overlay */}
      {isSmartAutoplaying && (
        <SmartAutoplayOverlay
          settings={video.player_settings?.smart_autoplay}
          onUnmute={handleSmartAutoplayUnmute}
        />
      )}

      {/* Banner Informativo Discreto de Autoplay Direto (exibido caso o navegador silencie o som) */}
      {showDirectUnmuteBanner && (
        <DirectUnmuteBanner
          buttonColor={video.player_settings?.smart_autoplay?.button_color || '#ef4444'}
          text={video.player_settings?.smart_autoplay?.text || 'Seu vídeo já começou!'}
          buttonText={video.player_settings?.smart_autoplay?.button_text || 'OUVIR'}
          onUnmute={() => {
            if (videoRef.current) {
              videoRef.current.muted = false
              videoRef.current.volume = 1.0
              setIsMuted(false)
              setShowDirectUnmuteBanner(false)
              videoRef.current.play().catch(() => {})
            }
          }}
        />
      )}

      {/* Botão de Play Inteligente (Overlay Padrão) */}
      {!isPlaying && !isSmartAutoplaying && (
        <BigPlayOverlay
          primaryColor={primaryColor}
          shape={video.player_settings?.play_button_shape}
          size={video.player_settings?.play_button_size}
          onPlay={handlePlay}
        />
      )}

      {/* Botão de CTA com delay */}
      <CtaButtonOverlay
        show={showCta && Boolean(video.player_settings?.cta_enabled)}
        ctaLink={video.player_settings?.cta_link}
        ctaText={video.player_settings?.cta_text}
        onClick={handleCtaClick}
      />
    </div>
  )
}
