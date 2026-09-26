import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomPlayerControls } from '../components/CustomPlayerControls'
import { EmbedPlayer } from '../components/EmbedPlayer'
import type { ChaptersSettings, SmartProgressSettings, Video } from '../types/video'

const chapters: ChaptersSettings = {
  enabled: true,
  items: [
    { id: 'a', time: '00:00', seconds: 0, title: 'Abertura' },
    { id: 'b', time: '00:50', seconds: 50, title: 'Pitch' },
  ],
}

function renderControls(opts: { currentTime: number; smartProgress?: SmartProgressSettings; chapters?: ChaptersSettings }) {
  const onSeek = vi.fn()
  render(
    <CustomPlayerControls
      isPlaying
      isMuted={false}
      currentTime={opts.currentTime}
      duration={100}
      currentSpeed={1}
      primaryColor="#ef4444"
      chapters={opts.chapters}
      smartProgress={opts.smartProgress}
      onTogglePlay={vi.fn()}
      onToggleMute={vi.fn()}
      onRewind10={vi.fn()}
      onForward10={vi.fn()}
      onCycleSpeed={vi.fn()}
      onToggleFullscreen={vi.fn()}
      onSeek={onSeek}
    />
  )
  return { onSeek }
}

describe('Embed - Progresso Inteligente na barra do player', () => {
  it('ligado, troca o range por uma barra só visual preenchida pela curva', () => {
    renderControls({ currentTime: 50, smartProgress: { enabled: true, intensity: 'medio' } })

    expect(screen.queryByTestId('embed-progress-bar')).not.toBeInTheDocument()
    const bar = screen.getByTestId('embed-smart-progress-bar')
    expect(bar).toHaveAttribute('role', 'progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '75')
    expect(screen.getByTestId('embed-smart-progress-fill')).toHaveStyle({ width: '75%' })
  })

  it('ligado, clicar na barra não faz seek', () => {
    const { onSeek } = renderControls({ currentTime: 20, smartProgress: { enabled: true, intensity: 'forte' } })
    fireEvent.click(screen.getByTestId('embed-smart-progress-bar'))
    expect(onSeek).not.toHaveBeenCalled()
  })

  it('ligado com capítulos, segmentos seguem a curva e não fazem seek ao clicar', () => {
    const { onSeek } = renderControls({
      currentTime: 25,
      chapters,
      smartProgress: { enabled: true, intensity: 'medio' },
    })

    const seg0 = screen.getByTestId('embed-chapter-segment-0')
    const seg1 = screen.getByTestId('embed-chapter-segment-1')
    // t=25s de 100s (médio): visual 43,75% da barra; 1º segmento ocupa 75% → 58,33% preenchido
    const fill0 = parseFloat((seg0.firstChild as HTMLElement).style.width)
    expect(fill0).toBeCloseTo((0.4375 / 0.75) * 100, 1)
    expect((seg1.firstChild as HTMLElement).style.width).toBe('0%')

    fireEvent.click(seg1)
    expect(onSeek).not.toHaveBeenCalled()
  })

  it('desligado, mantém o range arrastável e os capítulos clicáveis como antes', () => {
    const { onSeek } = renderControls({ currentTime: 25, smartProgress: { enabled: false, intensity: 'forte' } })
    expect(screen.queryByTestId('embed-smart-progress-bar')).not.toBeInTheDocument()
    fireEvent.change(screen.getByTestId('embed-progress-bar'), { target: { value: '40' } })
    expect(onSeek).toHaveBeenCalledWith(40)
  })

  it('desligado com capítulos, clique no segmento continua levando ao início do capítulo', () => {
    const { onSeek } = renderControls({ currentTime: 25, chapters })
    fireEvent.click(screen.getByTestId('embed-chapter-segment-1'))
    expect(onSeek).toHaveBeenCalledWith(50)
  })

  it('EmbedPlayer repassa player_settings.smart_progress para a barra', async () => {
    const video: Video = {
      id: 'vid-embed-smart-progress',
      title: 'Embed com Progresso Inteligente',
      video_url: 'https://cdn.exemplo.com/video.mp4',
      duration: 120,
      player_settings: {
        primary_color: '#4f46e5',
        autoplay: false,
        show_controls: true,
        cta_enabled: false,
        cta_time: 0,
        cta_text: '',
        cta_link: '',
        smart_progress: { enabled: true, intensity: 'suave' },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    global.fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(url.includes('/videos/') ? video : { status: 'ok' }),
      })
    )

    render(<EmbedPlayer videoId={video.id} />)

    await waitFor(() => {
      expect(screen.getByTestId('embed-smart-progress-bar')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('embed-progress-bar')).not.toBeInTheDocument()
  })
})
