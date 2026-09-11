import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { VideoCreateView } from '../components/video-create/VideoCreateView'
import type { Video } from '../types/video'

describe('VideoCreateView - Tela Cheia de Criação e Upload de Vídeo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o cabeçalho idêntico ao editor com botão Voltar e título Novo Vídeo', () => {
    const onBackMock = vi.fn()
    render(
      <VideoCreateView
        onBack={onBackMock}
        onSuccess={() => {}}
        showToast={() => {}}
      />
    )

    expect(screen.getByTestId('video-create-view')).toBeInTheDocument()
    expect(screen.getByTestId('create-header')).toBeInTheDocument()
    expect(screen.getByTestId('back-to-videos-btn')).toHaveTextContent(/VOLTAR AOS VÍDEOS/i)
    expect(screen.getByTestId('create-view-title')).toHaveTextContent('Novo Vídeo')

    // Clicar em Voltar aos Vídeos chama onBack
    fireEvent.click(screen.getByTestId('back-to-videos-btn'))
    expect(onBackMock).toHaveBeenCalledTimes(1)
  })

  it('botão Cancelar também chama onBack', () => {
    const onBackMock = vi.fn()
    render(
      <VideoCreateView
        onBack={onBackMock}
        onSuccess={() => {}}
        showToast={() => {}}
      />
    )

    fireEvent.click(screen.getByTestId('create-video-cancel-btn'))
    expect(onBackMock).toHaveBeenCalledTimes(1)
  })

  it('permite alternar entre modo Upload e modo URL externa', async () => {
    render(
      <VideoCreateView
        onBack={() => {}}
        onSuccess={() => {}}
        showToast={() => {}}
      />
    )

    // Inicialmente no modo Upload com dropzone
    expect(screen.getByTestId('create-video-dropzone')).toBeInTheDocument()
    expect(screen.queryByTestId('create-video-url-input')).not.toBeInTheDocument()

    // Alterna para URL externa
    fireEvent.click(screen.getByTestId('create-video-mode-url'))
    expect(screen.getByTestId('create-video-url-input')).toBeInTheDocument()
    expect(screen.queryByTestId('create-video-dropzone')).not.toBeInTheDocument()

    // Alterna de volta para Upload
    fireEvent.click(screen.getByTestId('create-video-mode-upload'))
    expect(screen.getByTestId('create-video-dropzone')).toBeInTheDocument()
  })

  it('valida campos obrigatórios: exibe erro se submeter sem título ou sem vídeo', async () => {
    render(
      <VideoCreateView
        onBack={() => {}}
        onSuccess={() => {}}
        showToast={() => {}}
      />
    )

    const submitBtn = screen.getByTestId('create-video-submit-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('create-error-banner')).toBeInTheDocument()
      expect(screen.getByText(/informe o título do vídeo/i)).toBeInTheDocument()
    })

    // Preenche título mas sem vídeo
    const titleInput = screen.getByTestId('create-video-title-input')
    fireEvent.change(titleInput, { target: { value: 'VSL do Produto' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/selecione um arquivo de vídeo ou informe uma URL/i)).toBeInTheDocument()
    })
  })

  it('auto-preenche o título a partir do arquivo de vídeo selecionado', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: '/static/uploads/vsl_alta_conversao.mp4' }),
      })
    )

    render(
      <VideoCreateView
        onBack={() => {}}
        onSuccess={() => {}}
        showToast={() => {}}
      />
    )

    const fileInput = screen.getByTestId('create-video-file-input')
    const fakeFile = new File(['fake-content'], 'vsl_alta_conversao.mp4', { type: 'video/mp4' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } })
    })

    await waitFor(() => {
      const titleInput = screen.getByTestId('create-video-title-input') as HTMLInputElement
      expect(titleInput.value).toBe('Vsl alta conversao')
    })
  })

  it('submissão com sucesso chama a API e o callback onSuccess com o vídeo criado', async () => {
    const onSuccessMock = vi.fn()
    const showToastMock = vi.fn()

    const mockCreated: Video = {
      id: 'vid-new-123',
      title: 'VSL Milionária',
      video_url: 'https://exemplo.com/vsl.mp4',
      duration: 120,
      player_settings: {
        primary_color: '#ef4444',
        autoplay: true,
        show_controls: true,
        cta_enabled: false,
        cta_time: 0,
        cta_text: 'Comprar Agora',
        cta_link: 'https://checkout.com',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCreated),
      })
    )

    render(
      <VideoCreateView
        onBack={() => {}}
        onSuccess={onSuccessMock}
        showToast={showToastMock}
      />
    )

    // Preenche título
    fireEvent.change(screen.getByTestId('create-video-title-input'), {
      target: { value: 'VSL Milionária' },
    })

    // Muda para URL e preenche
    fireEvent.click(screen.getByTestId('create-video-mode-url'))
    fireEvent.change(screen.getByTestId('create-video-url-input'), {
      target: { value: 'https://exemplo.com/vsl.mp4' },
    })

    // Ativa autoplay
    fireEvent.click(screen.getByTestId('create-video-autoplay-checkbox'))

    // Submete
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-video-submit-btn'))
    })

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith(mockCreated)
    })
  })
})
