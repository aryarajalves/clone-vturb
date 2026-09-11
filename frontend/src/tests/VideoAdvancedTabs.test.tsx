import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { VideoSmartAutoplayTab } from '../components/video-detail/VideoSmartAutoplayTab'
import { VideoFloatingPlayerTab } from '../components/video-detail/VideoFloatingPlayerTab'
import { VideoPitchDelayTab } from '../components/video-detail/VideoPitchDelayTab'
import { VideoPixelsTab } from '../components/video-detail/VideoPixelsTab'
import { VideoSecurityTab } from '../components/video-detail/VideoSecurityTab'
import { EmbedPlayer } from '../components/EmbedPlayer'
import type { Video } from '../types/video'

const mockVideo: Video = {
  id: 'vid-adv-1',
  title: 'Vídeo VSL Avançado',
  video_url: 'https://cdn.exemplo.com/video.mp4',
  thumbnail_url: 'https://cdn.exemplo.com/thumb.jpg',
  duration: 180,
  player_settings: {
    primary_color: '#6366f1',
    autoplay: false,
    show_controls: true,
    cta_enabled: false,
    cta_time: 0,
    cta_text: 'Comprar',
    cta_link: 'https://checkout.com',
    smart_autoplay: {
      enabled: false,
      text: 'Vídeo começou!',
      subtext: 'Clique para áudio',
      button_color: '#ef4444',
      button_text: 'ATIVAR SOM',
      restart_on_unmute: false,
    },
    floating_player: {
      enabled: false,
      position: 'bottom-right',
      width: 320,
      closeable: true,
    },
    pitch_delay: {
      enabled: false,
      time: 60,
      target_css_selector: '.delay-pitch',
      auto_scroll: true,
      scroll_offset: 50,
      persistence: true,
    },
    tracking_pixels: {
      enabled: false,
      facebook_pixel_id: '',
      google_analytics_id: '',
      tiktok_pixel_id: '',
    },
    domain_protection: {
      enabled: false,
      allowed_domains: ['meusite.com'],
      anti_download: true,
    },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Mecânicas Avançadas do Vídeo - Configurações e Player', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('VideoSmartAutoplayTab: ativa switch, altera textos e salva configurações', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockVideo,
            player_settings: {
              ...mockVideo.player_settings,
              smart_autoplay: {
                enabled: true,
                text: 'Seu vídeo já começou!',
                subtext: 'Clique para ativar som',
                button_color: '#10b981',
                button_text: 'OUVIR AGORA',
                restart_on_unmute: true,
              },
            },
          }),
      })
    )

    render(
      <VideoSmartAutoplayTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.getByTestId('smart-autoplay-tab')).toBeInTheDocument()

    // Ativa switch
    const toggleBtn = screen.getByTestId('smart-autoplay-toggle')
    fireEvent.click(toggleBtn)

    // Altera tamanho para Pequeno e verifica na prévia
    const sizeSmallBtn = screen.getByTestId('smart-autoplay-size-small')
    fireEvent.click(sizeSmallBtn)
    expect(screen.getByTestId('smart-autoplay-card')).toHaveAttribute('data-size', 'small')

    // Altera tamanho para Mini
    const sizeMiniBtn = screen.getByTestId('smart-autoplay-size-mini')
    fireEvent.click(sizeMiniBtn)
    expect(screen.getByTestId('smart-autoplay-card')).toHaveAttribute('data-size', 'mini')

    // Altera texto do botão
    const btnTextInput = screen.getByTestId('smart-autoplay-button-text-input')
    fireEvent.change(btnTextInput, { target: { value: 'OUVIR AGORA' } })

    // Salvar
    const saveBtn = screen.getByTestId('smart-autoplay-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringContaining('Smart Autoplay')
      )
    })
  })

  it('VideoFloatingPlayerTab: ativa switch, seleciona posição e salva configurações', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockVideo,
            player_settings: {
              ...mockVideo.player_settings,
              floating_player: {
                enabled: true,
                position: 'bottom-left',
                width: 360,
                closeable: true,
              },
            },
          }),
      })
    )

    render(
      <VideoFloatingPlayerTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.getByTestId('floating-player-tab')).toBeInTheDocument()

    // Ativa switch
    const toggleBtn = screen.getByTestId('floating-player-toggle')
    fireEvent.click(toggleBtn)

    // Altera posição para canto inferior esquerdo
    const leftPosBtn = screen.getByTestId('floating-pos-bottom-left')
    fireEvent.click(leftPosBtn)

    // Salvar
    const saveBtn = screen.getByTestId('floating-player-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringContaining('Player Flutuante')
      )
    })
  })

  it('VideoPitchDelayTab: ativa delay, define seletor e salva configurações', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockVideo,
            player_settings: {
              ...mockVideo.player_settings,
              pitch_delay: {
                enabled: true,
                time: 120,
                target_css_selector: '#oferta-especial',
                auto_scroll: true,
                scroll_offset: 50,
                persistence: true,
              },
            },
          }),
      })
    )

    render(
      <VideoPitchDelayTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.getByTestId('pitch-delay-tab')).toBeInTheDocument()

    // Ativa switch
    const toggleBtn = screen.getByTestId('pitch-delay-toggle')
    fireEvent.click(toggleBtn)

    // Altera seletor
    const selectorInput = screen.getByTestId('pitch-delay-selector-input')
    fireEvent.change(selectorInput, { target: { value: '#oferta-especial' } })

    // Salvar
    const saveBtn = screen.getByTestId('pitch-delay-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringContaining('Pitch Delay')
      )
    })
  })

  it('VideoPixelsTab: ativa switch, preenche ID do Facebook e salva configurações', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockVideo,
            player_settings: {
              ...mockVideo.player_settings,
              tracking_pixels: {
                enabled: true,
                facebook_pixel_id: '1234567890',
              },
            },
          }),
      })
    )

    render(
      <VideoPixelsTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.getByTestId('pixels-tab')).toBeInTheDocument()

    // Ativa switch
    const toggleBtn = screen.getByTestId('pixels-toggle')
    fireEvent.click(toggleBtn)

    // Preenche Pixel FB
    const fbInput = screen.getByTestId('pixel-facebook-input')
    fireEvent.change(fbInput, { target: { value: '1234567890' } })

    // Salvar
    const saveBtn = screen.getByTestId('pixels-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringContaining('Pixels de rastreamento')
      )
    })
  })

  it('VideoSecurityTab: adiciona e remove domínios autorizados e salva', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockVideo,
            player_settings: {
              ...mockVideo.player_settings,
              domain_protection: {
                enabled: true,
                allowed_domains: ['meusite.com', 'app.meusite.com'],
                anti_download: true,
              },
            },
          }),
      })
    )

    render(
      <VideoSecurityTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.getByTestId('security-tab')).toBeInTheDocument()

    // Ativa switch
    const toggleBtn = screen.getByTestId('security-toggle')
    fireEvent.click(toggleBtn)

    // Adiciona novo domínio
    const inputDomain = screen.getByTestId('security-domain-input')
    const addDomainBtn = screen.getByTestId('security-add-domain-btn')
    fireEvent.change(inputDomain, { target: { value: 'app.meusite.com' } })
    fireEvent.click(addDomainBtn)

    // Salvar
    const saveBtn = screen.getByTestId('security-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringContaining('Proteção de domínio')
      )
    })
  })

  it('EmbedPlayer: exibe overlay do Smart Autoplay e desmuta ao clicar', async () => {
    const videoWithSmartAutoplay: Video = {
      ...mockVideo,
      player_settings: {
        ...mockVideo.player_settings,
        smart_autoplay: {
          enabled: true,
          text: 'Seu vídeo começou!',
          subtext: 'Clique para ouvir',
          button_color: '#ef4444',
          button_text: 'CLIQUE PARA OUVIR',
          restart_on_unmute: true,
        },
      },
    }

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(videoWithSmartAutoplay),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    render(<EmbedPlayer videoId={videoWithSmartAutoplay.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('smart-autoplay-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('smart-autoplay-card')).toHaveAttribute('data-size', 'medium')
      expect(screen.getByTestId('smart-autoplay-unmute-btn')).toHaveTextContent('CLIQUE PARA OUVIR')
    })

    // Clica para desmutar
    fireEvent.click(screen.getByTestId('smart-autoplay-unmute-btn'))

    await waitFor(() => {
      expect(screen.queryByTestId('smart-autoplay-overlay')).not.toBeInTheDocument()
    })
  })

  it('EmbedPlayer: bloqueia reprodução se domínio não for autorizado', async () => {
    const videoRestricted: Video = {
      ...mockVideo,
      player_settings: {
        ...mockVideo.player_settings,
        domain_protection: {
          enabled: true,
          allowed_domains: ['siteautorizado.com.br'],
          anti_download: true,
        },
      },
    }

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(videoRestricted),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    render(<EmbedPlayer videoId={videoRestricted.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('domain-blocked-view')).toBeInTheDocument()
      expect(screen.getByText('Reprodução Não Autorizada')).toBeInTheDocument()
    })
  })
})
