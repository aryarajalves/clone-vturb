import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initTrackingPixels, triggerTrackingPixels } from '../utils/embedTracking'
import { generateEmbedCode } from '../utils/embedScriptGenerator'
import type { Video, TrackingPixelsSettings } from '../types/video'

describe('Tracking Pixels Injection & Event Tracking', () => {
  const originalWindow = { ...window }

  beforeEach(() => {
    // Limpa scripts e propriedades no window antes de cada teste
    document.head.innerHTML = ''
    delete (window as any).fbq
    delete (window as any)._fbq
    delete (window as any).gtag
    delete (window as any).dataLayer
    delete (window as any).ttq
    delete (window as any).TiktokAnalyticsObject
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('não injeta scripts se tracking estiver desabilitado ou indefinido', () => {
    initTrackingPixels(undefined)
    expect(document.head.querySelectorAll('script').length).toBe(0)

    initTrackingPixels({
      enabled: false,
      facebook_pixel_id: '123456789',
      google_analytics_id: 'G-12345',
      tiktok_pixel_id: 'C12345',
    })
    expect(document.head.querySelectorAll('script').length).toBe(0)
  })

  it('injeta SDK do Meta Pixel (Facebook) e dispara PageView', () => {
    const tracking: TrackingPixelsSettings = {
      enabled: true,
      facebook_pixel_id: 'FB_PIXEL_999',
    }

    initTrackingPixels(tracking)

    // Script do Facebook no head
    const script = Array.from(document.head.querySelectorAll('script')).find(
      (s) => s.src === 'https://connect.facebook.net/en_US/fbevents.js'
    )
    expect(script).toBeDefined()
    expect((window as any).fbq).toBeDefined()
  })

  it('injeta SDK do Google Tag e inicializa dataLayer e gtag', () => {
    const tracking: TrackingPixelsSettings = {
      enabled: true,
      google_analytics_id: 'G-TEST1234',
    }

    initTrackingPixels(tracking)

    const script = Array.from(document.head.querySelectorAll('script')).find((s) =>
      s.src.includes('googletagmanager.com/gtag/js?id=G-TEST1234')
    )
    expect(script).toBeDefined()
    expect((window as any).gtag).toBeDefined()
    expect(Array.isArray((window as any).dataLayer)).toBe(true)
  })

  it('injeta SDK do TikTok Pixel e inicializa métodos ttq', () => {
    const tracking: TrackingPixelsSettings = {
      enabled: true,
      tiktok_pixel_id: 'TT_PIXEL_555',
    }

    initTrackingPixels(tracking)

    expect((window as any).ttq).toBeDefined()
    expect(typeof (window as any).ttq.load).toBe('function')
    expect(typeof (window as any).ttq.page).toBe('function')

    const script = Array.from(document.head.querySelectorAll('script')).find((s) =>
      s.src.includes('analytics.tiktok.com/i18n/pixel/events.js?sdkid=TT_PIXEL_555')
    )
    expect(script).toBeDefined()
  })

  it('triggerTrackingPixels dispara eventos em fbq, gtag, ttq e envia postMessage', () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage')
    const fbqMock = vi.fn()
    const gtagMock = vi.fn()
    const ttqMock = { track: vi.fn() }

    ;(window as any).fbq = fbqMock
    ;(window as any).gtag = gtagMock
    ;(window as any).ttq = ttqMock

    const tracking: TrackingPixelsSettings = {
      enabled: true,
      facebook_pixel_id: 'FB_123',
      events: [
        { trigger: 'percent_50', event_name: 'CustomWatch50', enabled: true },
        { trigger: 'percent_75', event_name: 'CustomWatch75', enabled: false },
      ],
    }

    // Disparo de 50%
    triggerTrackingPixels('percent_50', 'vid-test-01', tracking)

    expect(fbqMock).toHaveBeenCalledWith('trackCustom', 'CustomWatch50', { video_id: 'vid-test-01' })
    expect(gtagMock).toHaveBeenCalledWith('event', 'CustomWatch50', { video_id: 'vid-test-01' })
    expect(ttqMock.track).toHaveBeenCalledWith('CustomWatch50', { video_id: 'vid-test-01' })
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'VTURB_PIXEL_TRACK',
        trigger: 'percent_50',
        eventName: 'CustomWatch50',
        videoId: 'vid-test-01',
      }),
      '*'
    )

    // Evento desabilitado (75%) não deve disparar
    fbqMock.mockClear()
    triggerTrackingPixels('percent_75', 'vid-test-01', tracking)
    expect(fbqMock).not.toHaveBeenCalled()
  })

  it('generateEmbedCode embute inicializador autônomo dos Pixels e listener VTURB_PIXEL_TRACK', () => {
    const mockVideo: Video = {
      id: 'vid-embed-pixel',
      title: 'Vídeo com Rastreamento',
      video_url: 'https://cdn.exemplo.com/video.mp4',
      player_settings: {
        tracking_pixels: {
          enabled: true,
          facebook_pixel_id: 'FB_AUTONOMOUS_99',
          google_analytics_id: 'G-AUTONOMOUS_88',
          tiktok_pixel_id: 'TT_AUTONOMOUS_77',
        },
      },
    }

    const embedCode = generateEmbedCode({
      video: mockVideo,
      embedUrl: 'https://app.vturb.com/?embed=vid-embed-pixel',
      embedType: 'iframe',
      resolvedWidth: '100%',
      resolvedHeight: null,
      heightPreset: '16:9',
      paddingTopMap: { '16:9': '56.25%' },
    })

    // Deve conter o listener para o evento VTURB_PIXEL_TRACK
    expect(embedCode).toContain("if (e.data.type === 'VTURB_PIXEL_TRACK')")
    expect(embedCode).toContain("window.fbq('trackCustom', evt, { video_id: e.data.videoId })")
    expect(embedCode).toContain("window.gtag('event', evt, { video_id: e.data.videoId })")
    expect(embedCode).toContain("window.ttq.track(evt, { video_id: e.data.videoId })")

    // Deve conter os dados de tracking serializados
    expect(embedCode).toContain('FB_AUTONOMOUS_99')
    expect(embedCode).toContain('G-AUTONOMOUS_88')
    expect(embedCode).toContain('TT_AUTONOMOUS_77')

    // Deve conter os snippets de injeção autônoma dos SDKs
    expect(embedCode).toContain('connect.facebook.net/en_US/fbevents.js')
    expect(embedCode).toContain('googletagmanager.com/gtag/js?id=')
    expect(embedCode).toContain('analytics.tiktok.com/i18n/pixel/events.js')
  })
})
