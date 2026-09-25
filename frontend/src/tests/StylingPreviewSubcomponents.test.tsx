import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StylingPreviewHeader } from '../components/video-detail/styling/StylingPreviewHeader'
import { StylingBigPlayButton } from '../components/video-detail/styling/StylingBigPlayButton'
import { StylingProgressBar } from '../components/video-detail/styling/StylingProgressBar'
import { StylingPlayerControlsBar } from '../components/video-detail/styling/StylingPlayerControlsBar'

describe('StylingPreviewSubcomponents', () => {
  describe('StylingPreviewHeader', () => {
    it('renderiza título e dispara troca de aspect ratio ao clicar nos botões', () => {
      const onRatioChange = vi.fn()
      render(
        <StylingPreviewHeader
          aspectRatio="16:9"
          onAspectRatioChange={onRatioChange}
        />
      )

      expect(screen.getByText('Prévia Visual em Tempo Real')).toBeInTheDocument()

      const mobileBtn = screen.getByTestId('preview-toggle-9-16')
      fireEvent.click(mobileBtn)
      expect(onRatioChange).toHaveBeenCalledWith('9:16')

      const desktopBtn = screen.getByTestId('preview-toggle-16-9')
      fireEvent.click(desktopBtn)
      expect(onRatioChange).toHaveBeenCalledWith('16:9')
    })
  })

  describe('StylingBigPlayButton', () => {
    it('renderiza o botão quando pausado e dispara onTogglePlay ao clicar', () => {
      const onToggle = vi.fn()
      const { rerender } = render(
        <StylingBigPlayButton
          isPlaying={false}
          playShape="circle"
          playSize="large"
          primaryColor="#6366f1"
          onTogglePlay={onToggle}
        />
      )

      const btn = screen.getByTestId('styling-big-play-btn')
      expect(btn).toBeInTheDocument()
      fireEvent.click(btn)
      expect(onToggle).toHaveBeenCalledTimes(1)

      rerender(
        <StylingBigPlayButton
          isPlaying={true}
          playShape="circle"
          playSize="large"
          primaryColor="#6366f1"
          onTogglePlay={onToggle}
        />
      )
      expect(screen.queryByTestId('styling-big-play-btn')).not.toBeInTheDocument()
    })
  })

  describe('StylingProgressBar', () => {
    it('renderiza barra contínua quando capítulos estão desativados', () => {
      const onSeek = vi.fn()
      const onChapterClick = vi.fn()

      render(
        <StylingProgressBar
          progressBar={true}
          duration={120}
          currentTime={30}
          primaryColor="#6366f1"
          onSeek={onSeek}
          onChapterClick={onChapterClick}
        />
      )

      const input = screen.getByTestId('styling-progress-bar')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('30')
    })

    it('renderiza segmentos de capítulos quando habilitado com 2+ itens', () => {
      const onSeek = vi.fn()
      const onChapterClick = vi.fn()

      const chapters = {
        enabled: true,
        items: [
          { id: 'c1', seconds: 0, time: '00:00', title: 'Intro' },
          { id: 'c2', seconds: 40, time: '00:40', title: 'Oferta' },
        ],
      }

      render(
        <StylingProgressBar
          progressBar={true}
          chapters={chapters}
          duration={100}
          currentTime={10}
          primaryColor="#6366f1"
          onSeek={onSeek}
          onChapterClick={onChapterClick}
        />
      )

      expect(screen.getByTestId('styling-chapters-progress-bar')).toBeInTheDocument()
      const seg0 = screen.getByTestId('chapter-segment-0')
      const seg1 = screen.getByTestId('chapter-segment-1')
      expect(seg0).toBeInTheDocument()
      expect(seg1).toBeInTheDocument()

      fireEvent.click(seg1)
      expect(onChapterClick).toHaveBeenCalledWith(40)
    })
  })

  describe('StylingPlayerControlsBar', () => {
    it('dispara ações de rewind, forward, speed e fullscreen', () => {
      const onTogglePlay = vi.fn()
      const onSeek = vi.fn()
      const onChapterClick = vi.fn()
      const onRewind = vi.fn()
      const onForward = vi.fn()
      const onVolumeChange = vi.fn()
      const onToggleMute = vi.fn()
      const onCycleSpeed = vi.fn()
      const onToggleFullscreen = vi.fn()

      render(
        <StylingPlayerControlsBar
          progressBar={true}
          duration={120}
          currentTime={25}
          primaryColor="#6366f1"
          isPlaying={false}
          rewind10s={true}
          forward10s={true}
          volume={true}
          fullscreen={true}
          speedControl={true}
          videoTime={true}
          volumeLevel={1}
          isMuted={false}
          currentSpeed={1.0}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          onChapterClick={onChapterClick}
          onRewind10={onRewind}
          onForward10={onForward}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
          onCycleSpeed={onCycleSpeed}
          onToggleFullscreen={onToggleFullscreen}
        />
      )

      fireEvent.click(screen.getByTestId('preview-control-play'))
      expect(onTogglePlay).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByTestId('preview-control-rewind'))
      expect(onRewind).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByTestId('preview-control-forward'))
      expect(onForward).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByTestId('preview-control-speed'))
      expect(onCycleSpeed).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByTestId('preview-control-fullscreen'))
      expect(onToggleFullscreen).toHaveBeenCalledTimes(1)

      expect(screen.getByTestId('styling-video-time')).toBeInTheDocument()
    })
  })
})
