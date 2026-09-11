import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VideoList } from '../components/VideoList'
import type { Video } from '../types/video'

const createMockVideos = (count: number): Video[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `vid-${i + 1}`,
    title: `Vídeo de Teste #${i + 1}`,
    video_url: `https://storage.exemplo.com/videos/vsl_${i + 1}.mp4`,
    thumbnail_url: `https://storage.exemplo.com/thumbs/thumb_${i + 1}.jpg`,
    duration: 120 + i,
    plays_count: i * 10,
    player_settings: {
      primary_color: '#4f46e5',
      playback_rate: 1.0,
      turbo_enabled: false,
    },
    created_at: new Date('2026-09-10T12:00:00Z').toISOString(),
    updated_at: new Date('2026-09-10T12:00:00Z').toISOString(),
  }))
}

describe('Paginação da Lista de Vídeos (Máx. 20 por página)', () => {
  it('exibe no máximo 20 vídeos por página e paginação quando há 25 vídeos cadastrados', () => {
    const videos25 = createMockVideos(25)
    const onEditMock = vi.fn()
    const onDeleteMock = vi.fn()

    render(
      <VideoList
        videos={videos25}
        loading={false}
        onDelete={onDeleteMock}
        onEdit={onEditMock}
        onOpenImport={() => {}}
      />
    )

    // Verifica que a barra de paginação existe
    expect(screen.getByTestId('pagination-bar')).toBeInTheDocument()

    // Verifica o texto informativo da página 1 (mostrando 1 a 20 de 25)
    const info = screen.getByTestId('pagination-info')
    expect(info).toHaveTextContent('Mostrando 1 a 20 de 25 vídeos (máx. 20 por página)')

    // Verifica que o vídeo 1 está na tela, mas o vídeo 21 NÃO está na página 1
    expect(screen.getByTestId('video-row-vid-1')).toBeInTheDocument()
    expect(screen.getByTestId('video-row-vid-20')).toBeInTheDocument()
    expect(screen.queryByTestId('video-row-vid-21')).not.toBeInTheDocument()

    // Botão Anterior deve estar desativado na página 1
    const prevBtn = screen.getByTestId('pagination-prev-btn')
    expect(prevBtn).toBeDisabled()

    // Botão Próximo deve estar ativado
    const nextBtn = screen.getByTestId('pagination-next-btn')
    expect(nextBtn).toBeEnabled()

    // Botão da página 2 está presente
    const page2Btn = screen.getByTestId('pagination-page-2')
    expect(page2Btn).toBeInTheDocument()

    // Clicar no botão Próximo
    fireEvent.click(nextBtn)

    // Agora na página 2: Mostrando 21 a 25 de 25
    expect(screen.getByTestId('pagination-info')).toHaveTextContent(
      'Mostrando 21 a 25 de 25 vídeos (máx. 20 por página)'
    )

    // O vídeo 21 ao 25 devem estar visíveis, e o vídeo 1 não deve mais estar visível
    expect(screen.queryByTestId('video-row-vid-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('video-row-vid-21')).toBeInTheDocument()
    expect(screen.getByTestId('video-row-vid-25')).toBeInTheDocument()

    // Botão Próximo agora deve estar desativado na última página
    expect(nextBtn).toBeDisabled()
    // Botão Anterior agora deve estar habilitado
    expect(prevBtn).toBeEnabled()

    // Voltar para página 1 usando o botão Anterior
    fireEvent.click(prevBtn)
    expect(screen.getByTestId('pagination-info')).toHaveTextContent(
      'Mostrando 1 a 20 de 25 vídeos (máx. 20 por página)'
    )
    expect(screen.getByTestId('video-row-vid-1')).toBeInTheDocument()
  })

  it('exibe todos os vídeos sem botões de navegação quando a quantidade for <= 20', () => {
    const videos5 = createMockVideos(5)

    render(
      <VideoList
        videos={videos5}
        loading={false}
        onDelete={() => {}}
        onEdit={() => {}}
        onOpenImport={() => {}}
      />
    )

    // Texto informativo deve refletir 1 a 5 de 5
    expect(screen.getByTestId('pagination-info')).toHaveTextContent(
      'Mostrando 1 a 5 de 5 vídeos (máx. 20 por página)'
    )

    // Como só tem 1 página, não deve renderizar botões de anterior/próximo
    expect(screen.queryByTestId('pagination-prev-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pagination-next-btn')).not.toBeInTheDocument()
  })
})
