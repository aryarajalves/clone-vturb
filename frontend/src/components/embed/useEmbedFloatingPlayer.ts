import { useEffect, useState } from 'react'
import type { Video } from '../../types/video'

interface UseEmbedFloatingPlayerOptions {
  video: Video | null
  videoId: string
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  isInsideIframe: boolean
}

export function useEmbedFloatingPlayer({
  video,
  videoId,
  isPlaying,
  setIsPlaying,
  containerRef,
  videoRef,
  isInsideIframe,
}: UseEmbedFloatingPlayerOptions) {
  const [isFloating, setIsFloating] = useState(false)
  const [floatingDismissed, setFloatingDismissed] = useState(false)

  // Notificação do estado de play para a janela mãe (site externo incorporando iframe)
  useEffect(() => {
    try {
      window.parent?.postMessage({ type: 'VTURB_PLAY_STATE', isPlaying, videoId }, '*')
    } catch {}
  }, [isPlaying, videoId])

  // Ouvinte de comandos remotos (ex: pausar vídeo vindo do documento pai)
  useEffect(() => {
    const onCmd = (e: MessageEvent) => {
      if (e.data?.type === 'VTURB_COMMAND' && e.data?.action === 'pause') {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }
    }
    window.addEventListener('message', onCmd)
    return () => window.removeEventListener('message', onCmd)
  }, [videoRef, setIsPlaying])

  // Observer para ativação de player flutuante no embed direto
  useEffect(() => {
    const floating = video?.player_settings?.floating_player
    if (!floating?.enabled || !containerRef.current || isInsideIframe) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFloatingDismissed(false)
          setIsFloating(false)
        } else {
          setIsFloating(true)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [video, containerRef, isInsideIframe])

  const floatingConfig = video?.player_settings?.floating_player
  const isFloatingActive = !isInsideIframe && isFloating && !floatingDismissed && Boolean(floatingConfig?.enabled)

  const handleDismissFloating = () => {
    setFloatingDismissed(true)
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  return {
    isFloating,
    floatingDismissed,
    setFloatingDismissed,
    isFloatingActive,
    floatingConfig,
    handleDismissFloating,
  }
}
