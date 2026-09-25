import type { TrackingPixelsSettings } from '../types/video'

/**
 * Inicializa automaticamente os SDKs oficiais das plataformas de anúncios configuradas
 * (Facebook Pixel, Google Tag / Ads e TikTok Pixel).
 */
export function initTrackingPixels(tracking?: TrackingPixelsSettings): void {
  if (typeof window === 'undefined' || !tracking?.enabled) return

  const w = window as any

  // 1. Inicializa Facebook Pixel (Meta)
  const fbId = tracking.facebook_pixel_id?.trim()
  if (fbId) {
    try {
      if (!w.fbq) {
        const n: any = (w.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        })
        if (!w._fbq) w._fbq = n
        n.push = n
        n.loaded = true
        n.version = '2.0'
        n.queue = []
        const s = document.createElement('script')
        s.async = true
        s.src = 'https://connect.facebook.net/en_US/fbevents.js'
        document.head.appendChild(s)
      }
      w.fbq('init', fbId)
      w.fbq('track', 'PageView')
    } catch {}
  }

  // 2. Inicializa Google Tag (Analytics / Google Ads)
  const gId = tracking.google_analytics_id?.trim()
  if (gId) {
    try {
      if (!w.gtag) {
        const s = document.createElement('script')
        s.async = true
        s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gId)}`
        document.head.appendChild(s)
        w.dataLayer = w.dataLayer || []
        w.gtag = function () {
          w.dataLayer.push(arguments)
        }
        w.gtag('js', new Date())
      }
      w.gtag('config', gId)
    } catch {}
  }

  // 3. Inicializa TikTok Pixel
  const ttId = tracking.tiktok_pixel_id?.trim()
  if (ttId) {
    try {
      if (!w.ttq) {
        const ttq: any = (w.ttq = [])
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ]
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
          }
        }
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i])
        }
        ttq.instance = function (t: any) {
          const e = ttq._i[t] || []
          for (let n = 0; n < ttq.methods.length; n++) {
            ttq.setAndDefer(e, ttq.methods[n])
          }
          return e
        }
        ttq.load = function (e: any) {
          const i = 'https://analytics.tiktok.com/i18n/pixel/events.js'
          ttq._i = ttq._i || {}
          ttq._i[e] = []
          ttq._i[e]._u = i
          ttq._t = ttq._t || {}
          ttq._t[e] = +new Date()
          ttq._o = ttq._o || {}
          ttq._o[e] = {}
          const o = document.createElement('script')
          o.type = 'text/javascript'
          o.async = true
          o.src = `${i}?sdkid=${e}&lib=ttq`
          document.head.appendChild(o)
        }
      }
      w.ttq.load(ttId)
      w.ttq.page()
    } catch {}
  }
}

/**
 * Dispara os eventos de conversão e marcos do vídeo nos SDKs das plataformas e via postMessage.
 */
export function triggerTrackingPixels(
  triggerKey: 'percent_25' | 'percent_50' | 'percent_75' | 'percent_100' | 'pitch',
  videoId: string,
  tracking?: TrackingPixelsSettings
): void {
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
    if (w.ttq && typeof w.ttq.track === 'function') {
      w.ttq.track(eventName, { video_id: videoId })
    }
  }
}
