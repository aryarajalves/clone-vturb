import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoStylingTab } from '../components/video-detail/VideoStylingTab'
import {
  timeStringToSeconds,
  secondsToTimeString,
} from '../components/video-detail/styling/StylingChaptersPanel'
import type { Video } from '../types/video'

const mockVideo: Video = {
  id: 'vid-vertical-chapters',
  title: 'Vídeo Modo Vertical e Capítulos',
  video_url: 'https://exemplo.com/video-reels.mp4',
  thumbnail_url: 'https://exemplo.com/thumb-reels.jpg',
  duration: 120,
  player_settings: {
    primary_color: '#3b82f6',
    autoplay: false,
    show_controls: true,
    aspect_ratio: '16:9',
    border_radius: 12,
    cta_enabled: false,
    cta_time: 0,
    cta_text: 'Comprar',
    cta_link: 'https://checkout.com',
    chapters: {
      enabled: false,
      items: [],
    },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Modo Vertical Celular (9:16) e Capítulos do Vídeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Funções Utilitárias de Tempo dos Capítulos', () => {
    it('converte string de tempo para segundos com precisão', () => {
      expect(timeStringToSeconds('00:00')).toBe(0)
      expect(timeStringToSeconds('00:50')).toBe(50)
      expect(timeStringToSeconds('01:20')).toBe(80)
      expect(timeStringToSeconds('01:30:15')).toBe(5415)
    })

    it('converte segundos para string formatada MM:SS', () => {
      expect(secondsToTimeString(0)).toBe('00:00')
      expect(secondsToTimeString(50)).toBe('00:50')
      expect(secondsToTimeString(80)).toBe('01:20')
      expect(secondsToTimeString(125)).toBe('02:05')
    })
  })

  describe('Modo Vertical Celular (9:16)', () => {
    it('alterna para modo vertical (9:16) no botão de proporção e atualiza a prévia visual', () => {
      const onSaveMock = vi.fn()
      const showToastMock = vi.fn()

      render(
        <VideoStylingTab
          video={mockVideo}
          onSave={onSaveMock}
          showToast={showToastMock}
        />
      )

      const previewContainer = screen.getByTestId('styling-video-preview-container')
      // Padrão 16:9
      expect(previewContainer).toHaveStyle({ aspectRatio: '16/9' })

      // Clica no botão Vertical Celular (9:16) no painel de aparência
      const verticalRatioBtn = screen.getByTestId('styling-ratio-9-16')
      fireEvent.click(verticalRatioBtn)

      // Prévia agora simula um celular vertical 9:16 com largura limitada
      expect(previewContainer).toHaveStyle({ aspectRatio: '9/16' })
      expect(previewContainer).toHaveStyle({ maxWidth: '340px' })

      // Clica no toggle rápido do cabeçalho da prévia para voltar ao 16:9
      const desktopToggle = screen.getByTestId('preview-toggle-16-9')
      fireEvent.click(desktopToggle)
      expect(previewContainer).toHaveStyle({ aspectRatio: '16/9' })

      // Clica no toggle rápido da prévia para 9:16 Celular
      const mobileToggle = screen.getByTestId('preview-toggle-9-16')
      fireEvent.click(mobileToggle)
      expect(previewContainer).toHaveStyle({ aspectRatio: '9/16' })
    })
  })

  describe('Painel e Marcadores de Capítulos', () => {
    it('renderiza o cabeçalho de capítulos com badge novo e ativação por switch', () => {
      const onSaveMock = vi.fn()
      const showToastMock = vi.fn()

      render(
        <VideoStylingTab
          video={mockVideo}
          onSave={onSaveMock}
          showToast={showToastMock}
        />
      )

      // Painel presente
      expect(screen.getByTestId('styling-chapters-panel')).toBeInTheDocument()
      expect(screen.getByText('Capítulos')).toBeInTheDocument()
      expect(screen.getByText('novo')).toBeInTheDocument()

      // Inicialmente desativado: lista de capítulos não está visível
      expect(screen.queryByTestId('chapters-items-list')).not.toBeInTheDocument()

      // Ativa o switch de capítulos
      const switchBtn = screen.getByTestId('toggle-chapters-switch')
      fireEvent.click(switchBtn)

      // Lista de capítulos passa a ser visível com capítulos iniciais
      expect(screen.getByTestId('chapters-items-list')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-row-0')).toBeInTheDocument()
    })

    it('permite adicionar novos capítulos, editar tempo/título e excluir capítulos', () => {
      const onSaveMock = vi.fn()
      const showToastMock = vi.fn()

      render(
        <VideoStylingTab
          video={mockVideo}
          onSave={onSaveMock}
          showToast={showToastMock}
        />
      )

      // Ativa capítulos
      fireEvent.click(screen.getByTestId('toggle-chapters-switch'))

      // Adiciona um terceiro capítulo
      const addBtn = screen.getByTestId('add-chapter-btn')
      fireEvent.click(addBtn)
      expect(screen.getByTestId('chapter-row-2')).toBeInTheDocument()

      // Edita o tempo e título do primeiro capítulo
      const timeInput0 = screen.getByTestId('chapter-time-0') as HTMLInputElement
      fireEvent.change(timeInput0, { target: { value: '00:00' } })

      const titleInput0 = screen.getByTestId('chapter-title-0') as HTMLInputElement
      fireEvent.change(titleInput0, { target: { value: 'parte principal' } })
      expect(titleInput0.value).toBe('parte principal')

      // Edita o segundo capítulo conforme o print do usuário (00:50 parte secundaria)
      const timeInput1 = screen.getByTestId('chapter-time-1') as HTMLInputElement
      fireEvent.change(timeInput1, { target: { value: '00:50' } })

      const titleInput1 = screen.getByTestId('chapter-title-1') as HTMLInputElement
      fireEvent.change(titleInput1, { target: { value: 'parte secundaria' } })
      expect(titleInput1.value).toBe('parte secundaria')

      // Exclui o terceiro capítulo
      const deleteBtn2 = screen.getByTestId('chapter-delete-2')
      fireEvent.click(deleteBtn2)
      expect(screen.queryByTestId('chapter-row-2')).not.toBeInTheDocument()
    })

    it('exibe a barra de progresso segmentada por capítulos na prévia do player', () => {
      const videoWithChapters: Video = {
        ...mockVideo,
        player_settings: {
          ...mockVideo.player_settings,
          chapters: {
            enabled: true,
            items: [
              { id: 'c1', time: '00:00', seconds: 0, title: 'parte principal' },
              { id: 'c2', time: '00:50', seconds: 50, title: 'parte secundaria' },
              { id: 'c3', time: '01:20', seconds: 80, title: 'Descrição' },
            ],
          },
        },
      }

      render(
        <VideoStylingTab
          video={videoWithChapters}
          onSave={vi.fn()}
          showToast={vi.fn()}
        />
      )

      // Verifica se a barra segmentada de capítulos é renderizada
      expect(screen.getByTestId('styling-chapters-progress-bar')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-segment-0')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-segment-1')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-segment-2')).toBeInTheDocument()
    })

    it('salva configurações de modo vertical e capítulos com sucesso via API', async () => {
      const onSaveMock = vi.fn()
      const showToastMock = vi.fn()

      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockVideo,
              player_settings: {
                ...mockVideo.player_settings,
                aspect_ratio: '9:16',
                chapters: {
                  enabled: true,
                  items: [
                    { id: 'c1', time: '00:00', seconds: 0, title: 'Introdução' },
                  ],
                },
              },
            }),
        })
      )

      render(
        <VideoStylingTab
          video={mockVideo}
          onSave={onSaveMock}
          showToast={showToastMock}
        />
      )

      // Seleciona modo vertical 9:16
      fireEvent.click(screen.getByTestId('styling-ratio-9-16'))

      // Ativa capítulos
      fireEvent.click(screen.getByTestId('toggle-chapters-switch'))

      // Salva
      fireEvent.click(screen.getByTestId('save-styling-bottom-btn'))

      await waitFor(() => {
        expect(onSaveMock).toHaveBeenCalled()
        expect(showToastMock).toHaveBeenCalledWith('Estilização e controles do vídeo salvos com sucesso!')
      })
    })
  })
})
