import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import App from '../App'

describe('App Dashboard VTurb Layout', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    )
  })

  it('renderiza a Topbar com o logotipo VTurb e exclusivamente o botão Novo Vídeo', async () => {
    await act(async () => {
      render(<App />)
    })

    expect(screen.getByTestId('topbar')).toBeInTheDocument()
    expect(screen.getByTestId('vturb-logo-text')).toHaveTextContent('Clone do VTurb')
    expect(screen.getByTestId('btn-novo-video')).toHaveTextContent('Novo Vídeo')
    expect(screen.queryByText('Premiações')).not.toBeInTheDocument()
    expect(screen.queryByTestId('plays-counter-badge')).not.toBeInTheDocument()
  })

  it('renderiza a Sidebar contendo apenas o botão Meus vídeos', async () => {
    await act(async () => {
      render(<App />)
    })

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeInTheDocument()

    const navItem = screen.getByTestId('nav-meus-videos')
    expect(navItem).toBeInTheDocument()
    expect(navItem).toHaveTextContent('Meus vídeos')
  })

  it('exibe o estado vazio com o texto "Nenhum vídeo criado ainda" quando não houver vídeos', async () => {
    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('empty-message-title')).toHaveTextContent('Nenhum vídeo criado ainda')
      expect(screen.getByTestId('empty-create-btn')).toBeInTheDocument()
    })
  })

  it('abre a tela cheia de criação e upload ao clicar em Novo Vídeo', async () => {
    await act(async () => {
      render(<App />)
    })

    const newVideoBtn = screen.getByTestId('btn-novo-video')
    await act(async () => {
      fireEvent.click(newVideoBtn)
    })

    await waitFor(() => {
      expect(screen.getByTestId('video-create-view')).toBeInTheDocument()
      expect(screen.getByText('Subir e Configurar Novo Vídeo')).toBeInTheDocument()
    })
  })

  it('oculta a Sidebar e o botão Novo Vídeo durante a edição e restaura ao clicar em Voltar', async () => {
    const mockList = [
      {
        id: 'vid-teste-1',
        title: 'Vídeo para Edição',
        video_url: 'https://exemplo.com/v.mp4',
        thumbnail_url: 'https://exemplo.com/t.jpg',
        duration: 60,
        plays_count: 5,
        player_settings: {
          primary_color: '#6366f1',
          autoplay: true,
          show_controls: true,
          cta_enabled: false,
          cta_time: 0,
          cta_text: '',
          cta_link: '',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockList),
      })
    )

    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Vídeo para Edição')).toBeInTheDocument()
    })

    // Antes da edição: Sidebar e botão Novo Vídeo visíveis
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('btn-novo-video')).toBeInTheDocument()

    // Clicar em Editar
    const editBtn = screen.getByTestId('edit-btn-vid-teste-1')
    await act(async () => {
      fireEvent.click(editBtn)
    })

    // Durante a edição: Sidebar e botão Novo Vídeo devem DESAPARECER
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btn-novo-video')).not.toBeInTheDocument()
    expect(screen.getByTestId('back-to-videos-btn')).toBeInTheDocument()

    // Clicar em Voltar aos Vídeos
    const backBtn = screen.getByTestId('back-to-videos-btn')
    await act(async () => {
      fireEvent.click(backBtn)
    })

    // Após voltar: Sidebar e botão Novo Vídeo reaparecem
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('btn-novo-video')).toBeInTheDocument()
  })
})
