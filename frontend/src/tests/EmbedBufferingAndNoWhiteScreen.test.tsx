import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmbedPlayer } from '../components/EmbedPlayer'
import * as api from '../services/api'
import type { Video } from '../types/video'

vi.mock('../services/api', () => ({
  fetchVideo: vi.fn(),
  sendTelemetryEvent: vi.fn(),
  getMediaUrl: vi.fn((url) => url || ''),
}))

const mockVideoWithNoThumbnail: Video = {
  id: 'vid-no-thumb',
  title: 'Vídeo Sem Thumbnail',
  video_url: 'https://cdn.example.com/video.mp4',
  thumbnail_url: null,
  duration: 120,
  plays_count: 10,
  created_at: '2026-09-24T18:00:00Z',
  updated_at: '2026-09-24T18:00:00Z',
  player_settings: {
    primary_color: '#ef4444',
    autoplay: true,
    show_controls: true,
    transparent_background: true,
    smart_autoplay: {
      enabled: true,
      mode: 'direct',
      text: 'Seu vídeo já começou!',
      button_text: 'CLIQUE PARA OUVIR',
      button_color: '#ef4444',
      restart_on_unmute: false,
    },
  },
}

describe('EmbedPlayer - Eliminação de Tela Branca nos Primeiros Segundos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.fetchVideo).mockResolvedValue(mockVideoWithNoThumbnail)
  })

  it('exibe fundo #000000 e overlay de buffering inicial para não mostrar tela branca', async () => {
    render(<EmbedPlayer videoId="vid-no-thumb" />)

    // Aguarda o vídeo carregar da API
    await waitFor(() => {
      expect(screen.getByTestId('vturb-embed-player')).toBeInTheDocument()
    })

    const playerContainer = screen.getByTestId('vturb-embed-player')
    // Enquanto o primeiro frame não carregou, o fundo é 100% preto sólido (#000000)
    expect(playerContainer).toHaveStyle({ background: '#000000' })

    // O overlay de buffering discreto com spinner está ativo com zIndex alto
    const bufferingOverlay = screen.getByTestId('embed-buffering-overlay')
    expect(bufferingOverlay).toBeInTheDocument()

    const videoEl = document.querySelector('video') as HTMLVideoElement
    expect(videoEl).toBeInTheDocument()
    expect(videoEl.src).toBe('https://cdn.example.com/video.mp4')

    // Dispara o evento de frame pronto no elemento de vídeo
    Object.defineProperty(videoEl, 'readyState', { value: 3, configurable: true })
    fireEvent.playing(videoEl)

    // Após o frame estar pronto, o buffering overlay desaparece
    await waitFor(() => {
      expect(screen.queryByTestId('embed-buffering-overlay')).not.toBeInTheDocument()
    })
  })

  it('garante que na aba anônima (fora de iframe) o fundo permanece #000000 evitando tela branca nativa do navegador', async () => {
    render(<EmbedPlayer videoId="vid-no-thumb" />)

    await waitFor(() => {
      expect(screen.getByTestId('vturb-embed-player')).toBeInTheDocument()
    })

    const videoEl = document.querySelector('video') as HTMLVideoElement
    Object.defineProperty(videoEl, 'readyState', { value: 3, configurable: true })
    fireEvent.playing(videoEl)

    const playerContainer = screen.getByTestId('vturb-embed-player')
    // Fora de iframe, transparent_background não transforma a janela do Chrome em branca: mantém #000000
    expect(playerContainer).toHaveStyle({ background: '#000000' })
    expect(document.documentElement.classList.contains('transparent-bg')).toBe(false)
  })
})
