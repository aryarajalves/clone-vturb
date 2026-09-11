import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoSmartAutoplayTab } from '../components/video-detail/VideoSmartAutoplayTab'
import { VideoFloatingPlayerTab } from '../components/video-detail/VideoFloatingPlayerTab'
import { VideoPitchDelayTab } from '../components/video-detail/VideoPitchDelayTab'
import { VideoPixelsTab } from '../components/video-detail/VideoPixelsTab'
import { VideoSecurityTab } from '../components/video-detail/VideoSecurityTab'
import { VideoTurboTab } from '../components/video-detail/VideoTurboTab'
import type { Video } from '../types/video'

const mockVideoDisabled: Video = {
  id: 'vid-test-cond-1',
  title: 'Vídeo para Teste Condicional',
  video_url: 'https://cdn.exemplo.com/video.mp4',
  duration: 120,
  player_settings: {
    turbo_enabled: false,
    playback_rate: 1.0,
    smart_autoplay: {
      enabled: false,
      text: 'Vídeo em andamento',
      subtext: 'Clique para áudio',
      button_color: '#ef4444',
      button_text: 'OUVIR',
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
      target_css_selector: '#oferta',
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

describe('Renderização Condicional das Configurações de Vídeo (Ocultar quando Desativado)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVideoDisabled),
      })
    )
  })

  it('Smart Autoplay: esconde formulário inferior quando desativado e exibe ao ativar', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoSmartAutoplayTab
        video={mockVideoDisabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Inicialmente desativado -> formulário inferior não deve existir na tela
    expect(screen.queryByTestId('smart-autoplay-form-container')).not.toBeInTheDocument()

    // Ativa o switch
    fireEvent.click(screen.getByTestId('smart-autoplay-toggle'))

    // Agora o formulário e prévia inferior devem estar visíveis
    expect(screen.getByTestId('smart-autoplay-form-container')).toBeInTheDocument()
    expect(screen.getByTestId('smart-autoplay-button-text-input')).toBeInTheDocument()
    expect(screen.getByTestId('smart-autoplay-size-small')).toBeInTheDocument()
    expect(screen.getByTestId('smart-autoplay-size-mini')).toBeInTheDocument()
  })

  it('Smart Autoplay: ao desativar o switch, executa auto-save e oculta conteúdo inferior', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    const videoEnabled: Video = {
      ...mockVideoDisabled,
      player_settings: {
        ...mockVideoDisabled.player_settings,
        smart_autoplay: {
          ...mockVideoDisabled.player_settings?.smart_autoplay,
          enabled: true,
        },
      },
    }

    render(
      <VideoSmartAutoplayTab
        video={videoEnabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Inicialmente ativado
    expect(screen.getByTestId('smart-autoplay-form-container')).toBeInTheDocument()

    // Desativa o switch
    fireEvent.click(screen.getByTestId('smart-autoplay-toggle'))

    // Conteúdo inferior deve desaparecer imediatamente
    expect(screen.queryByTestId('smart-autoplay-form-container')).not.toBeInTheDocument()

    // Deve salvar automaticamente no backend e emitir toast
    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith('Smart Autoplay desativado com sucesso!')
    })
  })

  it('Player Flutuante: esconde opções e prévia quando desativado e exibe ao ativar', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoFloatingPlayerTab
        video={mockVideoDisabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.queryByTestId('floating-player-content')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('floating-player-toggle'))

    expect(screen.getByTestId('floating-player-content')).toBeInTheDocument()
  })

  it('Conteúdo Oculto (Pitch Delay): esconde formulário quando desativado e exibe ao ativar', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoPitchDelayTab
        video={mockVideoDisabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.queryByTestId('pitch-delay-content')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('pitch-delay-toggle'))

    expect(screen.getByTestId('pitch-delay-content')).toBeInTheDocument()
  })

  it('Pixels & Rastreamento: esconde formulário quando desativado e exibe ao ativar', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoPixelsTab
        video={mockVideoDisabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.queryByTestId('pixels-content')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('pixels-toggle'))

    expect(screen.getByTestId('pixels-content')).toBeInTheDocument()
  })

  it('Segurança & Domínios: esconde formulário quando desativado e exibe ao ativar', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoSecurityTab
        video={mockVideoDisabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    expect(screen.queryByTestId('security-content')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('security-toggle'))

    expect(screen.getByTestId('security-content')).toBeInTheDocument()
  })

  it('Modo Turbo: esconde controles e prévia quando desativado e exibe ao ativar', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoTurboTab
        video={mockVideoDisabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Inicialmente desativado -> data-testid="turbo-content" não deve existir
    expect(screen.queryByTestId('turbo-content')).not.toBeInTheDocument()

    // Ativa o switch
    fireEvent.click(screen.getByTestId('turbo-toggle'))

    // Conteúdo e controles de velocidade devem estar visíveis
    expect(screen.getByTestId('turbo-content')).toBeInTheDocument()
    expect(screen.getByTestId('turbo-speed-slider')).toBeInTheDocument()
  })

  it('Modo Turbo: ao desativar o switch, executa auto-save e oculta conteúdo inferior', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    const videoTurboEnabled: Video = {
      ...mockVideoDisabled,
      player_settings: {
        ...mockVideoDisabled.player_settings,
        turbo_enabled: true,
        playback_rate: 1.5,
      },
    }

    render(
      <VideoTurboTab
        video={videoTurboEnabled}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Inicialmente ativado -> data-testid="turbo-content" visível
    expect(screen.getByTestId('turbo-content')).toBeInTheDocument()

    // Desativa o switch
    fireEvent.click(screen.getByTestId('turbo-toggle'))

    // Conteúdo deve sumir imediatamente
    expect(screen.queryByTestId('turbo-content')).not.toBeInTheDocument()

    // Auto-save deve ser disparado e emitir toast
    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith('Modo Turbo desativado com sucesso!')
    })
  })
})
