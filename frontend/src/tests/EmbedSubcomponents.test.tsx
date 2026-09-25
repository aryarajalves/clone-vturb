import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmbedBufferingOverlay } from '../components/embed/EmbedBufferingOverlay'
import { EmbedFloatingCloseButton } from '../components/embed/EmbedFloatingCloseButton'

describe('EmbedSubcomponents', () => {
  describe('EmbedBufferingOverlay', () => {
    it('renderiza overlay de buffering quando o vídeo ainda não está pronto', () => {
      render(<EmbedBufferingOverlay isVideoReady={false} primaryColor="#6366f1" />)
      expect(screen.getByTestId('embed-buffering-overlay')).toBeInTheDocument()
    })

    it('não renderiza overlay quando o vídeo já está pronto', () => {
      render(<EmbedBufferingOverlay isVideoReady={true} primaryColor="#6366f1" />)
      expect(screen.queryByTestId('embed-buffering-overlay')).not.toBeInTheDocument()
    })
  })

  describe('EmbedFloatingCloseButton', () => {
    it('renderiza botão e chama onClose ao clicar quando isFloatingActive é true', () => {
      const onClose = vi.fn()
      render(
        <EmbedFloatingCloseButton
          isFloatingActive={true}
          closeable={true}
          onClose={onClose}
        />
      )

      const btn = screen.getByTestId('floating-player-close')
      expect(btn).toBeInTheDocument()
      fireEvent.click(btn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('não renderiza botão quando closeable é false', () => {
      render(
        <EmbedFloatingCloseButton
          isFloatingActive={true}
          closeable={false}
          onClose={() => {}}
        />
      )

      expect(screen.queryByTestId('floating-player-close')).not.toBeInTheDocument()
    })
  })
})
