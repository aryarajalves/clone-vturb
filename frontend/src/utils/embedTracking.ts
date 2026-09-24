import type { TrackingPixelsSettings } from '../types/video'

export function triggerTrackingPixels(
  triggerKey: 'percent_25' | 'percent_50' | 'percent_75' | 'percent_100' | 'pitch',
  videoId: string,
  tracking?: TrackingPixelsSettings
) {
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
