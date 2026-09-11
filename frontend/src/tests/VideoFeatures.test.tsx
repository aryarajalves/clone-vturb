import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { VideoList } from '../components/VideoList'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { ImportVideoModal } from '../components/ImportVideoModal'
import { VideoDetailView } from '../components/video-detail/VideoDetailView'
import { VideoSettingsTab } from '../components/video-detail/VideoSettingsTab'
import { VideoEmbedTab } from '../components/video-detail/VideoEmbedTab'
import { VideoMetricsTab } from '../components/video-detail/VideoMetricsTab'
import type { Video } from '../types/video'

const mockVideo: Video = {
  id: 'vid-12345',
  title: 'Vídeo Promocional VSL',
  video_url: 'https://exemplo.com/vsl.mp4',
  thumbnail_url: 'https://exemplo.com/capa.jpg',
  duration: 120,
  player_settings: {
    primary_color: '#6366f1',
    autoplay: true,
    show_controls: true,
    cta_enabled: true,
    cta_time: 30,
    cta_text: 'Comprar Agora',
    cta_link: 'https://checkout.com',
    play_button_shape: 'circle',
    play_button_size: 'medium',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Mecânicas de Vídeo - Frontend', () => {
  it('VideoList possui apenas um botão para edição, exibe plays, data com hora e minuto e chama onEdit ao clicar', () => {
    const onEditMock = vi.fn()
    const newVideoWithZeroPlays: Video = {
      ...mockVideo,
      id: 'vid-novo-0',
      created_at: '2026-09-11T12:34:00Z', // 09:34 em Brasília (UTC-3)
      plays_count: 0,
    }

    render(
      <VideoList
        videos={[newVideoWithZeroPlays]}
        loading={false}
        onDelete={() => {}}
        onEdit={onEditMock}
        onOpenImport={() => {}}
      />
    )

    // O contador de plays deve exibir 0
    const playsBadge = screen.getByTestId('video-plays-vid-novo-0')
    expect(playsBadge).toHaveTextContent('0')

    // Deve exibir data com hora e minuto
    const dateBadge = screen.getByTestId('video-created-at-vid-novo-0')
    expect(dateBadge).toHaveTextContent(/11\/09\/2026 às 09:34/)

    // Deve existir APENAS o botão de edição e o de exclusão (sem os botões antigos soltos de clock ou code)
    const editBtn = screen.getByTestId('edit-btn-vid-novo-0')
    expect(editBtn).toHaveTextContent('Editar')
    expect(screen.queryByTestId('metrics-btn-vid-novo-0')).not.toBeInTheDocument()
    expect(screen.queryByTestId('embed-btn-vid-novo-0')).not.toBeInTheDocument()

    // Clicar no botão de edição dispara o onEdit
    fireEvent.click(editBtn)
    expect(onEditMock).toHaveBeenCalledWith(newVideoWithZeroPlays)
  })

  it('VideoDetailView exibe cabeçalho, segunda barra lateral e alterna entre as abas', async () => {
    const onBackMock = vi.fn()
    const onUpdateMock = vi.fn()

    render(
      <VideoDetailView
        video={mockVideo}
        onBack={onBackMock}
        onUpdateVideo={onUpdateMock}
        showToast={() => {}}
      />
    )

    // Cabeçalho fixo
    expect(screen.getByTestId('detail-header')).toBeInTheDocument()
    expect(screen.getByTestId('back-to-videos-btn')).toHaveTextContent(/Voltar aos Vídeos/i)
    expect(screen.getByTestId('detail-video-title')).toHaveTextContent(mockVideo.title)

    // Barra lateral com scroll independente
    const detailSidebar = screen.getByTestId('video-detail-sidebar')
    expect(detailSidebar).toHaveStyle({ height: '100%', overflowY: 'auto' })
    const mainContent = screen.getByTestId('video-detail-main-content')
    expect(mainContent).toHaveStyle({ height: '100%', overflowY: 'auto' })

    // As 3 abas exclusivas solicitadas pelo usuário
    expect(screen.getByTestId('tab-btn-settings')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-embed')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-metrics')).toBeInTheDocument()

    // Por padrão abre em Configurações
    expect(screen.getByTestId('settings-title-input')).toBeInTheDocument()

    // Alternar para Embedding
    fireEvent.click(screen.getByTestId('tab-btn-embed'))
    expect(screen.getByTestId('embed-code-text')).toBeInTheDocument()

    // Alternar para Métricas
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            video_id: mockVideo.id,
            total_impressions: 120,
            unique_impressions: 80,
            total_plays: 60,
            unique_plays: 40,
            play_rate: 50.0,
            total_clicks: 10,
            ctr: 16.6,
            avg_watch_time_seconds: 40,
            retention: { '25%': 50, '50%': 30, '75%': 20, '100%': 10 },
          }),
      })
    )
    fireEvent.click(screen.getByTestId('tab-btn-metrics'))
    await waitFor(() => {
      expect(screen.getByTestId('metric-total-plays')).toHaveTextContent('60')
      expect(screen.getByTestId('metric-unique-impressions')).toHaveTextContent('80')
    })

    // Clicar em Voltar chama onBack
    fireEvent.click(screen.getByTestId('back-to-videos-btn'))
    expect(onBackMock).toHaveBeenCalled()
  })

  it('VideoSettingsTab permite personalizar formato e tamanho do play e salva alterações', async () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    // Mock do updateVideo
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockVideo,
            title: 'Título Salvo',
            player_settings: {
              ...mockVideo.player_settings,
              play_button_shape: 'square',
              play_button_size: 'large',
            },
          }),
      })
    )

    render(
      <VideoSettingsTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Alterar formato do botão de play para Quadrado Moderno
    const squareBtn = screen.getByTestId('shape-option-square')
    fireEvent.click(squareBtn)

    // Alterar tamanho para Grande (104px)
    const largeBtn = screen.getByTestId('size-option-large')
    fireEvent.click(largeBtn)

    // Salvar
    const saveBtn = screen.getByTestId('settings-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          player_settings: expect.objectContaining({
            play_button_shape: 'square',
            play_button_size: 'large',
          }),
        })
      )
      expect(showToastMock).toHaveBeenCalledWith(expect.stringMatching(/sucesso/i))
    })
  })

  it('VideoSettingsTab organiza configurações em sub-abas (mídia, player, cta) e exibe prévias renderizadas de vídeo e thumbnail', async () => {
    render(
      <VideoSettingsTab
        video={mockVideo}
        onSave={() => {}}
        showToast={() => {}}
      />
    )

    // Sub-abas devem estar visíveis
    const mediaSubTab = screen.getByTestId('settings-subtab-media')
    const playerSubTab = screen.getByTestId('settings-subtab-player')
    const ctaSubTab = screen.getByTestId('settings-subtab-cta')

    expect(mediaSubTab).toBeInTheDocument()
    expect(playerSubTab).toBeInTheDocument()
    expect(ctaSubTab).toBeInTheDocument()

    // Na aba de Mídia (padrão inicial), os elementos de prévia de vídeo e thumbnail devem existir
    const videoPreview = screen.getByTestId('video-render-preview')
    const thumbPreview = screen.getByTestId('thumbnail-render-preview')
    expect(videoPreview).toBeInTheDocument()
    expect(thumbPreview).toBeInTheDocument()

    const renderedVideo = screen.getByTestId('rendered-video-element')
    expect(renderedVideo).toHaveAttribute('src', mockVideo.video_url)

    const renderedThumb = screen.getByTestId('rendered-thumbnail-image')
    expect(renderedThumb).toHaveAttribute('src', mockVideo.thumbnail_url)

    // Alternar para a aba Player
    fireEvent.click(playerSubTab)
    expect(screen.getByTestId('live-play-preview')).toBeInTheDocument()

    // Alternar para a aba CTA
    fireEvent.click(ctaSubTab)
    expect(screen.getByTestId('settings-cta-enable-check')).toBeChecked()
    expect(screen.getByTestId('cta-preview-button')).toBeInTheDocument()
  })

  it('VideoMetricsTab organiza métricas em sub-abas, renderiza gráfico de pico estilo VTurb e filtros por data', async () => {
    const mockHourlyList = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
      impressions: i === 19 ? 50 : 10,
      plays: i === 19 ? 35 : 5,
      clicks: 2,
    }))

    global.fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            video_id: mockVideo.id,
            period: 'all',
            total_impressions: 250,
            unique_impressions: 180,
            total_plays: 120,
            unique_plays: 95,
            play_rate: 48.0,
            total_clicks: 25,
            ctr: 20.8,
            avg_watch_time_seconds: 45,
            retention: { '25%': 90, '50%': 60, '75%': 40, '100%': 20 },
            hourly_distribution: mockHourlyList,
            peak_hour: {
              hour: 19,
              label: '19:00 - 20:00',
              impressions: 50,
              plays: 35,
              total_activity: 85,
            },
          }),
      })
    )

    render(<VideoMetricsTab video={mockVideo} showToast={() => {}} />)

    // 1. Verifica filtros de período e tag do fuso de Brasília
    expect(screen.getByTestId('filter-btn-today')).toBeInTheDocument()
    expect(screen.getByTestId('filter-btn-yesterday')).toBeInTheDocument()
    expect(screen.getByTestId('filter-btn-7d')).toBeInTheDocument()
    expect(screen.getByTestId('filter-btn-30d')).toBeInTheDocument()
    expect(screen.getByTestId('filter-btn-1y')).toBeInTheDocument()
    expect(screen.getByTestId('filter-btn-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-btn-custom')).toBeInTheDocument()
    expect(screen.getByTestId('brasilia-timezone-tag')).toHaveTextContent(/Horário de Brasília/i)

    // 2. Aguarda carregamento inicial dos indicadores
    await waitFor(() => {
      expect(screen.getByTestId('metric-total-plays')).toHaveTextContent('120')
    })

    // 3. Clica em Personalizado e verifica campos de data
    fireEvent.click(screen.getByTestId('filter-btn-custom'))
    expect(screen.getByTestId('custom-date-container')).toBeInTheDocument()
    expect(screen.getByTestId('filter-start-date')).toBeInTheDocument()
    expect(screen.getByTestId('filter-end-date')).toBeInTheDocument()

    // 4. Verifica sub-abas
    const tabOverview = screen.getByTestId('metrics-subtab-overview')
    const tabHourly = screen.getByTestId('metrics-subtab-hourly')
    const tabRetention = screen.getByTestId('metrics-subtab-retention')

    expect(tabOverview).toBeInTheDocument()
    expect(tabHourly).toBeInTheDocument()
    expect(tabRetention).toBeInTheDocument()

    // 5. Alterna para a sub-aba de Horários & Pico (Gráfico estilo VTurb)
    fireEvent.click(tabHourly)
    expect(screen.getByTestId('peak-hour-card')).toBeInTheDocument()
    expect(screen.getByTestId('peak-hour-label')).toHaveTextContent('19:00 - 20:00')
    expect(screen.getByTestId('timezone-badge')).toHaveTextContent(/Horário de Brasília/i)
    expect(screen.getByTestId('hourly-chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('peak-badge')).toHaveTextContent('PICO')

    // 6. Alterna para a sub-aba de Retenção
    fireEvent.click(tabRetention)
    expect(screen.getByText(/Funil de Retenção de Audiência/i)).toBeInTheDocument()
  })

  it('VideoEmbedTab renderiza seletores de dimensões e copia o código de incorporação', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })

    render(<VideoEmbedTab video={mockVideo} showToast={() => {}} />)

    const codeArea = screen.getByTestId('embed-code-text')
    expect(codeArea.textContent).toContain('max-width:640px')

    // Alternar para 800px
    const btn800 = screen.getByTestId('width-preset-800')
    fireEvent.click(btn800)
    expect(codeArea.textContent).toContain('max-width:800px')

    // Alternar para formato vertical 9:16
    const btn916 = screen.getByTestId('ratio-preset-9-16')
    fireEvent.click(btn916)
    expect(codeArea.textContent).toContain('padding-top:177.77%')

    // Copiar
    const copyBtn = screen.getByTestId('copy-embed-btn')
    await act(async () => {
      fireEvent.click(copyBtn)
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('DeleteConfirmModal atende à regra de experiência do usuário (backdrop e sem fechar ao clicar fora)', () => {
    const onCancelMock = vi.fn()
    const onConfirmMock = vi.fn()

    render(
      <DeleteConfirmModal
        isOpen={true}
        title="Excluir Vídeo"
        itemName={mockVideo.title}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    )

    expect(screen.getByText(/Excluir Vídeo/i)).toBeInTheDocument()

    // Clicar no backdrop NÃO deve fechar
    const backdrop = screen.getByTestId('delete-modal-backdrop')
    fireEvent.click(backdrop)
    expect(onCancelMock).not.toHaveBeenCalled()

    // Clicar no botão cancelar
    const cancelBtn = screen.getByTestId('delete-modal-cancel')
    fireEvent.click(cancelBtn)
    expect(onCancelMock).toHaveBeenCalledTimes(1)
  })

  it('ImportVideoModal trava o scroll da página de fundo (body overflow hidden) enquanto aberto', () => {
    const { rerender } = render(
      <ImportVideoModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<ImportVideoModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('UploadField permite alternar entre modo Upload e modo URL externa', async () => {
    render(<ImportVideoModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />)

    expect(screen.getByTestId('video-upload-dropzone')).toBeInTheDocument()
    expect(screen.getByTestId('thumbnail-upload-dropzone')).toBeInTheDocument()

    const videoUrlTab = screen.getByTestId('video-upload-tab-url')
    await act(async () => {
      fireEvent.click(videoUrlTab)
    })
    expect(screen.getByTestId('video-upload-input')).toBeInTheDocument()
  })

  it('VideoTurboTab permite selecionar velocidades entre 0.5x e 2.0x, ajustar precisão e salvar', async () => {
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
              playback_rate: 1.5,
              turbo_enabled: true,
            },
          }),
      })
    )

    render(
      <VideoDetailView
        video={mockVideo}
        onBack={() => {}}
        onUpdateVideo={onSaveMock}
        showToast={showToastMock}
      />
    )

    // O botão Turbo deve estar presente na barra lateral
    const turboTabBtn = screen.getByTestId('tab-btn-turbo')
    expect(turboTabBtn).toBeInTheDocument()
    expect(turboTabBtn).toHaveTextContent(/Turbo/i)

    // Clicar na aba Turbo
    fireEvent.click(turboTabBtn)

    // O banner Turbo deve ser exibido com o switch de ativação
    expect(screen.getByTestId('turbo-banner')).toBeInTheDocument()
    expect(screen.getByTestId('turbo-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('turbo-status-text')).toHaveTextContent(/Desativado/i)
    expect(screen.getByTestId('turbo-disabled-notice')).toBeInTheDocument()
    expect(screen.getByTestId('current-speed-display')).toHaveTextContent('1.00x')

    // Ativar pelo switch toggle
    fireEvent.click(screen.getByTestId('turbo-toggle'))
    expect(screen.getByTestId('turbo-status-text')).toHaveTextContent(/Ativado/i)
    expect(screen.queryByTestId('turbo-disabled-notice')).not.toBeInTheDocument()

    // Presets entre 0.5x e 2.0x devem estar disponíveis
    const preset05 = screen.getByTestId('preset-speed-0.5')
    const preset15 = screen.getByTestId('preset-speed-1.5')
    const preset20 = screen.getByTestId('preset-speed-2')

    expect(preset05).toBeInTheDocument()
    expect(preset15).toBeInTheDocument()
    expect(preset20).toBeInTheDocument()

    // Clicar no preset 0.5x (mais devagar)
    fireEvent.click(preset05)
    expect(screen.getByTestId('current-speed-display')).toHaveTextContent('0.50x')

    // Clicar no preset 2.0x (ultra-rápido)
    fireEvent.click(preset20)
    expect(screen.getByTestId('current-speed-display')).toHaveTextContent('2.00x')

    // Clicar no preset 1.5x (turbo recomendado)
    fireEvent.click(preset15)
    expect(screen.getByTestId('current-speed-display')).toHaveTextContent('1.50x')

    // Salvar configuração
    const saveBtn = screen.getByTestId('turbo-save-btn')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          player_settings: expect.objectContaining({
            playback_rate: 1.5,
            turbo_enabled: true,
          }),
        })
      )
      expect(showToastMock).toHaveBeenCalledWith(expect.stringMatching(/ativado/i))
    })

    // Desativar pelo botão Restaurar
    const resetBtn = screen.getByTestId('turbo-reset-btn')
    fireEvent.click(resetBtn)
    expect(screen.getByTestId('current-speed-display')).toHaveTextContent('1.00x')
    expect(screen.getByTestId('turbo-status-text')).toHaveTextContent(/Desativado/i)
  })
})


