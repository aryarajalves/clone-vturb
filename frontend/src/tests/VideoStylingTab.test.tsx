import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoStylingTab } from '../components/video-detail/VideoStylingTab'
import type { Video } from '../types/video'

const mockVideo: Video = {
  id: 'vid-styling-123',
  title: 'Vídeo para Teste de Estilização',
  video_url: 'https://exemplo.com/meu-video.mp4',
  thumbnail_url: 'https://exemplo.com/thumb.jpg',
  duration: 120,
  player_settings: {
    primary_color: '#6366f1',
    autoplay: false,
    show_controls: true,
    cta_enabled: false,
    cta_time: 0,
    cta_text: 'Comprar',
    cta_link: 'https://checkout.com',
    play_button_shape: 'circle',
    play_button_size: 'medium',
    controls_config: {
      rewind_10s: true,
      forward_10s: true,
      volume: true,
      fullscreen: true,
      speed_control: true,
    },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('VideoStylingTab - Customização Visual e Controles do Vídeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o cabeçalho, prévia em tempo real e a lista das 5 funções de controle', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoStylingTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Cabeçalho
    expect(screen.getByText(/Estilização do Vídeo/i)).toBeInTheDocument()

    // Prévia do vídeo
    expect(screen.getByTestId('styling-video-preview-container')).toBeInTheDocument()
    expect(screen.getByTestId('styling-preview-video')).toBeInTheDocument()
    expect(screen.getByTestId('styling-player-controls-bar')).toBeInTheDocument()

    // As 5 opções com os mesmos nomes e ícones da imagem
    expect(screen.getByTestId('toggle-control-rewind')).toHaveTextContent(/Voltar 10s/i)
    expect(screen.getByTestId('toggle-control-forward')).toHaveTextContent(/Avançar 10s/i)
    expect(screen.getByTestId('toggle-control-volume')).toHaveTextContent(/Volume/i)
    expect(screen.getByTestId('toggle-control-fullscreen')).toHaveTextContent(/Fullscreen/i)
    expect(screen.getByTestId('toggle-control-speed')).toHaveTextContent(/Controle de velocidade/i)
  })

  it('exibe e oculta dinamicamente os botões na barra de controles ao vivo da prévia ao alternar os checkboxes', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoStylingTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Inicialmente todos os 5 controles estão visíveis na barra do player
    expect(screen.getByTestId('preview-control-rewind')).toBeInTheDocument()
    expect(screen.getByTestId('preview-control-forward')).toBeInTheDocument()
    expect(screen.getByTestId('preview-control-volume')).toBeInTheDocument()
    expect(screen.getByTestId('preview-control-fullscreen')).toBeInTheDocument()
    expect(screen.getByTestId('preview-control-speed')).toBeInTheDocument()

    // Desativa Voltar 10s
    fireEvent.click(screen.getByTestId('toggle-control-rewind'))
    expect(screen.queryByTestId('preview-control-rewind')).not.toBeInTheDocument()

    // Desativa Fullscreen
    fireEvent.click(screen.getByTestId('toggle-control-fullscreen'))
    expect(screen.queryByTestId('preview-control-fullscreen')).not.toBeInTheDocument()

    // Reativa Voltar 10s
    fireEvent.click(screen.getByTestId('toggle-control-rewind'))
    expect(screen.getByTestId('preview-control-rewind')).toBeInTheDocument()
  })

  it('permite selecionar cor de destaque e formato do botão de play', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoStylingTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Clica no preset de cor verde #10b981
    const greenPreset = screen.getByTestId('styling-color-#10b981')
    fireEvent.click(greenPreset)

    // Altera formato do botão para Retangular Suave
    const roundedShapeBtn = screen.getByTestId('styling-shape-rounded')
    fireEvent.click(roundedShapeBtn)

    // Altera tamanho do botão para Grande
    const largeSizeBtn = screen.getByTestId('styling-size-large')
    fireEvent.click(largeSizeBtn)
  })

  it('salva com sucesso as alterações de estilização chamando a API', async () => {
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
              primary_color: '#10b981',
              controls_config: {
                rewind_10s: false,
                forward_10s: true,
                volume: true,
                fullscreen: true,
                speed_control: true,
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

    // Desativa Voltar 10s
    fireEvent.click(screen.getByTestId('toggle-control-rewind'))

    // Clica no botão Salvar
    fireEvent.click(screen.getByTestId('save-styling-bottom-btn'))

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled()
      expect(showToastMock).toHaveBeenCalledWith('Estilização e controles do vídeo salvos com sucesso!')
    })
  })

  it('renderiza o slider de Cantos Arredondados com limite de 0 a 20 e atualiza dinamicamente a prévia', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoStylingTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    const slider = screen.getByTestId('styling-border-radius-slider') as HTMLInputElement
    expect(slider).toBeInTheDocument()
    expect(slider.min).toBe('0')
    expect(slider.max).toBe('20')

    const valueDisplay = screen.getByTestId('styling-border-radius-value')
    expect(valueDisplay).toHaveTextContent('0')

    const previewContainer = screen.getByTestId('styling-video-preview-container')
    expect(previewContainer).toHaveStyle({ borderRadius: '0px' })

    // Move o slider para 20 (máximo arredondamento)
    fireEvent.change(slider, { target: { value: '20' } })
    expect(valueDisplay).toHaveTextContent('20')
    expect(previewContainer).toHaveStyle({ borderRadius: '20px' })

    // Move o slider para 12
    fireEvent.change(slider, { target: { value: '12' } })
    expect(valueDisplay).toHaveTextContent('12')
    expect(previewContainer).toHaveStyle({ borderRadius: '12px' })
  })

  it('permite alternar Barra de progresso e Tempo do Vídeo, refletindo na barra de controles da prévia', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoStylingTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    // Ambos começam ativos por padrão
    expect(screen.getByTestId('styling-progress-bar')).toBeInTheDocument()
    expect(screen.getByTestId('styling-video-time')).toBeInTheDocument()

    // Oculta a Barra de progresso
    fireEvent.click(screen.getByTestId('toggle-control-progress'))
    expect(screen.queryByTestId('styling-progress-bar')).not.toBeInTheDocument()

    // Oculta o Tempo do Vídeo
    fireEvent.click(screen.getByTestId('toggle-control-time'))
    expect(screen.queryByTestId('styling-video-time')).not.toBeInTheDocument()

    // Reativa a Barra de progresso
    fireEvent.click(screen.getByTestId('toggle-control-progress'))
    expect(screen.getByTestId('styling-progress-bar')).toBeInTheDocument()

    // Reativa o Tempo do Vídeo
    fireEvent.click(screen.getByTestId('toggle-control-time'))
    expect(screen.getByTestId('styling-video-time')).toBeInTheDocument()
  })

  it('exibe pequenas explicações em tooltip ao passar o mouse por cima de cada botão de controle visual', () => {
    const onSaveMock = vi.fn()
    const showToastMock = vi.fn()

    render(
      <VideoStylingTab
        video={mockVideo}
        onSave={onSaveMock}
        showToast={showToastMock}
      />
    )

    const controls = [
      {
        testId: 'toggle-control-progress',
        tooltipId: 'tooltip-control-progress_bar',
        titlePart: 'linha do tempo do vídeo',
      },
      {
        testId: 'toggle-control-time',
        tooltipId: 'tooltip-control-video_time',
        titlePart: 'tempo restante em contagem regressiva',
      },
      {
        testId: 'toggle-control-rewind',
        tooltipId: 'tooltip-control-rewind_10s',
        titlePart: 'voltar 10 segundos no vídeo',
      },
      {
        testId: 'toggle-control-forward',
        tooltipId: 'tooltip-control-forward_10s',
        titlePart: 'adiantar 10 segundos no vídeo',
      },
      {
        testId: 'toggle-control-volume',
        tooltipId: 'tooltip-control-volume',
        titlePart: 'controle e ícone de volume',
      },
      {
        testId: 'toggle-control-fullscreen',
        tooltipId: 'tooltip-control-fullscreen',
        titlePart: 'expandir o player de vídeo para tela inteira',
      },
      {
        testId: 'toggle-control-speed',
        tooltipId: 'tooltip-control-speed_control',
        titlePart: 'seletor no player para o espectador escolher a velocidade',
      },
    ]

    controls.forEach(({ testId, tooltipId, titlePart }) => {
      const button = screen.getByTestId(testId)

      // Verifica atributo nativo de title para acessibilidade
      expect(button).toHaveAttribute('title', expect.stringContaining(titlePart))

      // Inicialmente o tooltip flutuante não deve estar visível
      expect(screen.queryByTestId(tooltipId)).not.toBeInTheDocument()

      // Ao passar o mouse por cima do botão (hover)
      fireEvent.mouseEnter(button)
      const tooltip = screen.getByTestId(tooltipId)
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveTextContent(new RegExp(titlePart, 'i'))

      // Ao remover o mouse do botão
      fireEvent.mouseLeave(button)
      expect(screen.queryByTestId(tooltipId)).not.toBeInTheDocument()
    })
  })
})

