import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmbedPlayer } from '../components/EmbedPlayer'
import type { Video } from '../types/video'
import * as api from '../services/api'

const mockVerticalVideo: Video = {
  id: 'vertical-video-fs-test',
  title: 'Vídeo Vertical 9:16',
  video_url: 'https://cdn.example.com/vertical.mp4',
  duration: 90,
  player_settings: {
    primary_color: '#10b981',
    aspect_ratio: '9:16',
    fit_mode: 'cover',
    floating_player: {
      enabled: true,
      position: 'bottom-right',
      width: 320,
      closeable: true,
    },
  },
}

describe('EmbedPlayer - Fullscreen e Preservação de Formato Original', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'fetchVideo').mockResolvedValue(mockVerticalVideo)
  })

  it('preserva formato original com objectFit contain e fundo preto ao maximizar em fullscreen', async () => {
    render(<EmbedPlayer videoId="vertical-video-fs-test" />)

    // Aguarda carregar
    const container = await screen.findByTestId('vturb-embed-player')
    expect(container).toBeInTheDocument()

    const videoEl = container.querySelector('video') as HTMLVideoElement
    expect(videoEl).toBeInTheDocument()
    // Antes de fullscreen respeita cover conforme fit_mode
    expect(videoEl.style.objectFit).toBe('cover')

    // Simula entrada em Fullscreen (maximizar a tela)
    act(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: container,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    // Ao maximizar a tela, DEVE mudar para contain para manter o formato original 9:16 sem cortes
    expect(videoEl.style.objectFit).toBe('contain')
    expect(container.style.width).toBe('100vw')
    expect(container.style.height).toBe('100vh')

    // Simula saída do Fullscreen
    act(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    // Retorna ao estado normal
    expect(videoEl.style.objectFit).toBe('cover')
  })
})
