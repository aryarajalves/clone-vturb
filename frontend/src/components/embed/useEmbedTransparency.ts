import { useEffect, useState } from 'react'
import type { Video } from '../../types/video'

interface UseEmbedTransparencyOptions {
  video: Video | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  isTransparent: boolean
}

export function useEmbedTransparency({ video, videoRef, isTransparent }: UseEmbedTransparencyOptions) {
  const [isVideoReady, setIsVideoReady] = useState(false)

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
  }, [video, videoRef])

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

  return { isVideoReady, setIsVideoReady }
}
