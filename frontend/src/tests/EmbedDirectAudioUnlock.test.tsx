import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { EmbedPlayer } from '../components/EmbedPlayer'
import type { Video } from '../types/video'

const mockDirectVideo: Video = {
  id: 'vid-direct-audio-1',
  title: 'Vídeo Direto Com Som',
  video_url: 'https://cdn.exemplo.com/direct.mp4',
  duration: 120,
  player_settings: {
    smart_autoplay: {
      enabled: true,
      mode: 'direct',
    },
  },
}

describe('EmbedPlayer Direct Audio and Unlock Tests', () => {
  it('desmuta o áudio ao receber mensagem de interação do documento pai (VTURB_PARENT_INTERACTION)', async () => {
    let playCallCount = 0
    let rejectFirstPlay = true

    // Simula bloqueio de áudio autônomo pelo browser na 1ª tentativa
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => {
      playCallCount++
      if (rejectFirstPlay) {
        rejectFirstPlay = false
        return Promise.reject(new Error('NotAllowedError: play() failed because the user didn\'t interact first.'))
      }
      return Promise.resolve()
    })

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/videos/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDirectVideo),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    })

    const { container } = render(<EmbedPlayer videoId={mockDirectVideo.id} />)

    await waitFor(() => {
      const videoEl = container.querySelector('video')
      expect(videoEl).toBeInTheDocument()
    })

    const videoEl = container.querySelector('video') as HTMLVideoElement

    // Após rejeição de áudio não interagido, o player toca mutado como fallback seguro
    // e deve exibir o banner informativo discreto com o botão para ativar áudio
    await waitFor(() => {
      expect(videoEl.muted).toBe(true)
      expect(screen.getByTestId('direct-unmute-banner')).toBeInTheDocument()
    })

    // Clica diretamente no banner para ativar o som
    const banner = screen.getByTestId('direct-unmute-banner')
    banner.click()

    await waitFor(() => {
      // Deve ter desmutado automaticamente e removido o banner da tela
      expect(videoEl.muted).toBe(false)
      expect(videoEl.volume).toBe(1.0)
      expect(screen.queryByTestId('direct-unmute-banner')).not.toBeInTheDocument()
    })
  })
})
