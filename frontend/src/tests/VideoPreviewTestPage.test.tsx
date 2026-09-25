import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VideoPreviewTestPage } from '../components/preview/VideoPreviewTestPage'
import { VideoEmbedTab } from '../components/video-detail/VideoEmbedTab'
import type { Video } from '../types/video'
import * as api from '../services/api'

const mockVideo: Video = {
  id: 'preview-test-video-123',
  title: 'Vídeo Oficial de Demonstração VSL',
  video_url: 'https://cdn.example.com/vsl.mp4',
  thumbnail_url: 'https://cdn.example.com/thumb.jpg',
  duration: 180,
  plays_count: 99,
  created_at: '2026-09-25T10:00:00Z',
  updated_at: '2026-09-25T10:00:00Z',
  player_settings: {
    primary_color: '#4f46e5',
    aspect_ratio: '9:16',
    border_radius: 16,
    floating_player: {
      enabled: true,
      position: 'bottom-right',
      width: 320,
      closeable: true,
    },
    pitch_delay: {
      enabled: true,
      time: 45,
      target_css_selector: '.delay-pitch',
    },
  },
}

describe('VideoPreviewTestPage - Página de Teste Completa com Scroll', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'fetchVideo').mockResolvedValue(mockVideo)
  })

  it('renderiza o cabeçalho de teste, título da VSL e o iframe de embed', async () => {
    render(<VideoPreviewTestPage videoId="preview-test-video-123" />)

    // Aguarda o carregamento dos dados da API
    await waitFor(() => {
      expect(screen.getByText(/Página de Teste Ativa/i)).toBeInTheDocument()
      expect(screen.getByText(/• Ambiente de Teste/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Smart VSL/i).length).toBeGreaterThan(0)
    })

    // Título do vídeo renderizado na headline
    expect(screen.getByText('Vídeo Oficial de Demonstração VSL')).toBeInTheDocument()

    // Wrapper e Iframe presentes
    expect(screen.getByTestId('preview-test-wrapper')).toBeInTheDocument()
    const iframe = screen.getByTestId('preview-test-iframe') as HTMLIFrameElement
    expect(iframe).toBeInTheDocument()
    expect(iframe.src).toContain('embed=preview-test-video-123')
  })

  it('renderiza as seções de texto longas para possibilitar o teste de rolagem e flutuação', async () => {
    render(<VideoPreviewTestPage videoId="preview-test-video-123" />)

    await waitFor(() => {
      expect(screen.getByText(/Área de Teste do Player Flutuante/i)).toBeInTheDocument()
    })

    // Seção de benefícios
    expect(screen.getByText(/Tecnologia de VSL Projetada para Máxima Conversão/i)).toBeInTheDocument()
    expect(screen.getByText(/Smart Autoplay™ com Áudio Transparente/i)).toBeInTheDocument()
    expect(screen.getByText(/Mini-Player Flutuante \(Picture-in-Picture\)/i)).toBeInTheDocument()

    // Seção de texto longo e depoimentos
    expect(screen.getByText(/Como os maiores players do mercado aumentam a retenção/i)).toBeInTheDocument()
    expect(screen.getByText(/O Que Nossos Clientes Dizem/i)).toBeInTheDocument()
    expect(screen.getByText('Ricardo Mendes')).toBeInTheDocument()

    // Garantia e rodapé
    expect(screen.getByText(/Garantia Incondicional de 7 Dias/i)).toBeInTheDocument()
  })

  it('VideoEmbedTab: botão "Abrir em nova aba" aponta para a URL com preview da página de teste e parâmetros sincronizados', () => {
    render(
      <VideoEmbedTab
        video={mockVideo}
        showToast={vi.fn()}
      />
    )

    const openLink = screen.getByTestId('open-preview-tab-btn') as HTMLAnchorElement
    expect(openLink).toBeInTheDocument()
    expect(openLink.href).toContain('preview=preview-test-video-123')
    expect(decodeURIComponent(openLink.href)).toContain('ratio=9:16')
    expect(openLink.href).toContain('width=640px')
    expect(openLink.target).toBe('_blank')
  })

  it('aplica corretamente formato vertical 9:16 e modo cinema (fundo preto) recebidos via query params', async () => {
    // Simula query parameters da URL
    const originalLocation = window.location
    delete (window as any).location
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:3000',
      search: '?preview=preview-test-video-123&ratio=9:16&width=360px&transparent=0',
    } as any

    render(<VideoPreviewTestPage videoId="preview-test-video-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('preview-test-wrapper')).toBeInTheDocument()
    })

    const wrapper = screen.getByTestId('preview-test-wrapper')
    expect(wrapper.style.maxWidth).toBe('360px')
    expect(wrapper.style.background).toBe('rgb(0, 0, 0)')

    const iframe = screen.getByTestId('preview-test-iframe') as HTMLIFrameElement
    expect(decodeURIComponent(iframe.src)).toContain('ratio=9:16')
    expect(iframe.src).toContain('transparent=0')
    expect(iframe.src).toContain('width=360px')

    // Restaura window.location
    window.location = originalLocation
  })

  it('aplica altura fixa e 100% responsivo quando especificado nos query params', async () => {
    const originalLocation = window.location
    delete (window as any).location
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:3000',
      search: '?preview=preview-test-video-123&ratio=custom&width=100%25&height=520px&transparent=1',
    } as any

    render(<VideoPreviewTestPage videoId="preview-test-video-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('preview-test-wrapper')).toBeInTheDocument()
    })

    const wrapper = screen.getByTestId('preview-test-wrapper')
    expect(wrapper.style.maxWidth).toBe('100%')
    expect(wrapper.style.height).toBe('520px')
    expect(wrapper.style.background).toBe('transparent')

    const iframe = screen.getByTestId('preview-test-iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('height=520px')
    expect(iframe.src).toContain('transparent=1')

    window.location = originalLocation
  })
})
