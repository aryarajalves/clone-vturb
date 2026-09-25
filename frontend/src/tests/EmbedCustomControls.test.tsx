import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmbedPlayer } from '../components/EmbedPlayer'
import type { Video } from '../types/video'

const baseMockVideo: Video = {
  id: 'vid-embed-custom-controls',
  title: 'Vídeo Embed com Controles Customizados',
  video_url: 'https://cdn.exemplo.com/video.mp4',
  duration: 120,
  player_settings: {
    primary_color: '#4f46e5',
    autoplay: false,
    show_controls: true,
    controls_config: {
      progress_bar: true,
      video_time: true,
      rewind_10s: true,
      forward_10s: true,
      volume: true,
      fullscreen: true,
      speed_control: true,
    },
  },
}

describe('EmbedPlayer Custom Controls and Visual Options', () => {
  it('renderiza os controles customizados com barra de progresso e tempo do vídeo por padrão', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(baseMockVideo),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    const { container } = render(<EmbedPlayer videoId={baseMockVideo.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('embed-custom-controls')).toBeInTheDocument()
    })

    // O vídeo não deve usar o atributo controls nativo do browser
    const videoEl = container.querySelector('video')
    expect(videoEl).toBeInTheDocument()
    expect(videoEl).not.toHaveAttribute('controls')

    // Deve exibir barra de progresso e tempo do vídeo
    expect(screen.getByTestId('embed-progress-bar')).toBeInTheDocument()
    expect(screen.getByTestId('embed-video-time')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-play')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-rewind')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-forward')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-volume')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-speed')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-fullscreen')).toBeInTheDocument()
  })

  it('oculta a barra de progresso e o tempo do vídeo quando configurados como false', async () => {
    const videoWithoutProgressAndTime: Video = {
      ...baseMockVideo,
      id: 'vid-no-progress-time',
      player_settings: {
        ...baseMockVideo.player_settings!,
        controls_config: {
          progress_bar: false,
          video_time: false,
          rewind_10s: true,
          forward_10s: true,
          volume: true,
          fullscreen: true,
          speed_control: true,
        },
      },
    }

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(videoWithoutProgressAndTime),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    render(<EmbedPlayer videoId={videoWithoutProgressAndTime.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('embed-custom-controls')).toBeInTheDocument()
    })

    // NÃO deve exibir a barra de progresso nem o tempo do vídeo
    expect(screen.queryByTestId('embed-progress-bar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('embed-video-time')).not.toBeInTheDocument()

    // Demais controles permanecem presentes
    expect(screen.getByTestId('embed-control-play')).toBeInTheDocument()
    expect(screen.getByTestId('embed-control-volume')).toBeInTheDocument()
  })

  it('oculta toda a barra de controles se show_controls for false', async () => {
    const videoNoControls: Video = {
      ...baseMockVideo,
      id: 'vid-no-controls',
      player_settings: {
        ...baseMockVideo.player_settings!,
        show_controls: false,
      },
    }

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(videoNoControls),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    render(<EmbedPlayer videoId={videoNoControls.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('vturb-embed-player')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('embed-custom-controls')).not.toBeInTheDocument()
  })

  it('permite alterar o volume através do slider deslizante e alternar mute/unmute', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(baseMockVideo),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    const { container } = render(<EmbedPlayer videoId={baseMockVideo.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('embed-volume-container')).toBeInTheDocument()
    })

    const videoEl = container.querySelector('video') as HTMLVideoElement
    expect(videoEl).toBeInTheDocument()

    // Passa o mouse no container de volume para expandir o slider
    const volumeContainer = screen.getByTestId('embed-volume-container')
    fireEvent.mouseEnter(volumeContainer)

    const volumeSlider = screen.getByTestId('embed-volume-slider') as HTMLInputElement
    expect(volumeSlider).toBeInTheDocument()

    // Ajusta o volume para 0.4 (40%)
    fireEvent.change(volumeSlider, { target: { value: '0.4' } })
    expect(videoEl.volume).toBe(0.4)
    expect(videoEl.muted).toBe(false)

    // Ajusta o volume para 0 (muta automaticamente)
    fireEvent.change(volumeSlider, { target: { value: '0' } })
    expect(videoEl.muted).toBe(true)

    // Clica no botão de volume para desmutar
    const volumeBtn = screen.getByTestId('embed-control-volume')
    fireEvent.click(volumeBtn)
    expect(videoEl.muted).toBe(false)
  })

  it('notifica a janela mãe via postMessage (VTURB_PLAY_STATE) ao alterar estado de reprodução', async () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage')

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(baseMockVideo),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    const { container } = render(<EmbedPlayer videoId={baseMockVideo.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('embed-custom-controls')).toBeInTheDocument()
    })

    const playBtn = screen.getByTestId('embed-control-play')
    fireEvent.click(playBtn)

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VTURB_PLAY_STATE',
          videoId: baseMockVideo.id,
        }),
        '*'
      )
    })

    postMessageSpy.mockRestore()
  })
})
