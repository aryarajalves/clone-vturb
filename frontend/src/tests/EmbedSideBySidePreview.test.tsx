import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VideoEmbedTab } from '../components/video-detail/VideoEmbedTab'
import type { Video } from '../types/video'

describe('VideoEmbedTab - Layout Lado a Lado (Dimensões e Prévia)', () => {
  const mockVideo: Video = {
    id: 'test-video-embed-side-by-side',
    title: 'Vídeo Demonstração Lado a Lado',
    video_url: 'https://cdn.example.com/video.mp4',
    thumbnail_url: 'https://cdn.example.com/thumb.jpg',
    duration: 120,
    plays_count: 42,
    created_at: '2026-09-24T12:00:00Z',
    updated_at: '2026-09-24T12:00:00Z',
    player_settings: {
      primary_color: '#4f46e5',
      autoplay: true,
      show_controls: true,
      aspect_ratio: '16:9',
      border_radius: 8,
      floating_player: {
        enabled: true,
        position: 'bottom-right',
        width: 320,
        closeable: true,
      },
    },
  }

  it('renderiza os controles de dimensões e o card de prévia ao vivo lado a lado no topo', () => {
    render(<VideoEmbedTab video={mockVideo} showToast={() => {}} />)

    // Verifica card de dimensões
    expect(screen.getByText('Dimensões do Player (Largura e Altura)')).toBeInTheDocument()

    // Verifica card de prévia ao vivo posicionado ao lado
    const previewCard = screen.getByTestId('embed-live-preview-card')
    expect(previewCard).toBeInTheDocument()
    expect(screen.getByText('Prévia do Player')).toBeInTheDocument()

    // Verifica iframe da prévia
    const previewIframe = screen.getByTitle('Prévia ao Vivo do Player')
    expect(previewIframe).toBeInTheDocument()
    expect(previewIframe.getAttribute('src')).toContain('?embed=test-video-embed-side-by-side')
  })

  it('atualiza dinamicamente as dimensões na prévia e no código ao selecionar presets', async () => {
    render(<VideoEmbedTab video={mockVideo} showToast={() => {}} />)

    const codeArea = screen.getByTestId('embed-code-text')
    expect(codeArea.textContent).toContain('max-width:640px')

    // Alterna largura para 800px
    const btn800 = screen.getByTestId('width-preset-800')
    fireEvent.click(btn800)
    expect(codeArea.textContent).toContain('max-width:800px')

    // Alterna proporção para 9:16 vertical
    const btn916 = screen.getByTestId('ratio-preset-9-16')
    fireEvent.click(btn916)
    expect(codeArea.textContent).toContain('padding-top:177.77%')

    // O badge da prévia também exibe a dimensão calculada
    expect(screen.getByText(/800px • 9:16/i)).toBeInTheDocument()
  })

  it('permite alternar entre iframe responsivo e script widget mantendo a prévia visível', () => {
    render(<VideoEmbedTab video={mockVideo} showToast={() => {}} />)

    const scriptTabBtn = screen.getByTestId('embed-tab-type-script')
    fireEvent.click(scriptTabBtn)

    const codeArea = screen.getByTestId('embed-code-text')
    expect(codeArea.textContent).toContain('vturb-player-test-video-embed-side-by-side')

    // Prévia continua em exibição
    expect(screen.getByTestId('embed-live-preview-card')).toBeInTheDocument()
  })

  it('permite alternar entre "Apenas o Vídeo (Sem Fundo Preto)" e "Fundo Preto (Cinema)", atualizando a prévia e o código', async () => {
    render(<VideoEmbedTab video={mockVideo} showToast={() => {}} />)

    // Por padrão no mock sem transparent_background definido, inicia como transparente (Apenas o Vídeo)
    const viewport = screen.getByTestId('embed-preview-viewport')
    expect(viewport).toBeInTheDocument()
    expect(viewport.style.border).toContain('dashed')

    const codeArea = screen.getByTestId('embed-code-text')
    expect(codeArea.textContent).toContain('background:transparent;')
    expect(codeArea.textContent).toContain('allowtransparency="true"')

    // Clica no botão de Fundo Preto (Cinema)
    const btnCinema = screen.getByTestId('bg-preset-black')
    fireEvent.click(btnCinema)

    // O viewport passa a ter fundo preto cinema (#090d16) e sem borda dashed
    expect(viewport.style.background).toBe('rgb(9, 13, 22)')

    // O código gerado não tem mais a flag de transparência
    expect(codeArea.textContent).not.toContain('background:transparent;')

    // Clica novamente em "Apenas o Vídeo"
    const btnTransparent = screen.getByTestId('bg-preset-transparent')
    fireEvent.click(btnTransparent)

    expect(codeArea.textContent).toContain('background:transparent;')
  })

  it('renderiza o preset de largura 360px (Celular / Reels) e atualiza o código com max-width:360px', () => {
    render(<VideoEmbedTab video={mockVideo} showToast={() => {}} />)

    const btn360 = screen.getByTestId('width-preset-360')
    expect(btn360).toBeInTheDocument()

    fireEvent.click(btn360)
    const codeArea = screen.getByTestId('embed-code-text')
    expect(codeArea.textContent).toContain('max-width:360px')
  })
})
