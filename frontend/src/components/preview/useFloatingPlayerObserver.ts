import { useEffect, useState } from 'react'
import type { Video } from '../../types/video'

interface UseFloatingPlayerObserverProps {
  video: Video | null
  videoId: string
  effectiveRatio: string
}

export function useFloatingPlayerObserver({
  video,
  videoId,
  effectiveRatio,
}: UseFloatingPlayerObserverProps) {
  const [isPitchReached, setIsPitchReached] = useState(false)

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
      Object.assign(btn.style, {
        position: 'fixed',
        zIndex: '100000',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      })
      btn.onclick = (ev) => {
        ev.stopPropagation()
        isFloatingDismissed = true
        updateFloatingState(false)
        try {
          ;(ifr as any)?.contentWindow?.postMessage({ type: 'VTURB_COMMAND', action: 'pause' }, '*')
        } catch {}
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
        const marginEdge = 32
        const marginEdgeRight = 56
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
        })
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
  }, [video, videoId, effectiveRatio])

  return { isPitchReached }
}
