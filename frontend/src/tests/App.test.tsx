import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import App from '../App'

describe('App Dashboard VTurb Layout', () => {
  const mockUser = {
    id: 'admin-123',
    email: 'admin@vturb.com',
    is_super_admin: true,
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    localStorage.setItem('vturb_access_token', 'valid-test-token')
    global.fetch = vi.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = url.toString()
      if (urlStr.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    })
  })

  it('renderiza a tela de login quando o usuário não está autenticado', async () => {
    localStorage.removeItem('vturb_access_token')

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByTestId('login-view-container')).toBeInTheDocument()
    expect(screen.getByTestId('login-heading')).toHaveTextContent('Bem-vindo de volta')
  })

  it('permite realizar logout e retornar para a tela de login', async () => {
    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-email-display')).toHaveTextContent('admin@vturb.com')
    })

    const logoutBtn = screen.getByTestId('btn-logout')
    await act(async () => {
      fireEvent.click(logoutBtn)
    })

    // Confirmação no modal de logout
    const confirmLogoutBtn = screen.getByTestId('logout-modal-confirm')
    await act(async () => {
      fireEvent.click(confirmLogoutBtn)
    })

    await waitFor(() => {
      expect(screen.getByTestId('login-view-container')).toBeInTheDocument()
    })
  })

  it('desloga o usuário e exibe tela de login quando a sessão expira (401 após 24h)', async () => {
    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('topbar')).toBeInTheDocument()
    })

    // Dispara evento global de expiração de sessão emitido pelo api.ts ao receber 401
    await act(async () => {
      window.dispatchEvent(new CustomEvent('auth:session_expired'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('login-view-container')).toBeInTheDocument()
      expect(screen.getByTestId('toast-notification')).toHaveTextContent(/sessão expirou/i)
    })
  })

  it('renderiza a Topbar com o logotipo VTurb, botão Novo Vídeo e perfil do usuário', async () => {
    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('topbar')).toBeInTheDocument()
      expect(screen.getByTestId('vturb-logo-text')).toHaveTextContent('Smart VSL')
      expect(screen.getByTestId('btn-novo-video')).toHaveTextContent('Novo Vídeo')
      expect(screen.getByTestId('user-email-display')).toHaveTextContent('admin@vturb.com')
      expect(screen.getByTestId('user-superadmin-badge')).toHaveTextContent(/admin/i)
    })
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

  it('redireciona invariavelmente para a tela inicial Meus vídeos ao realizar login', async () => {
    // Simula estado deslogado com localStorage apontando para outra aba anterior
    localStorage.removeItem('vturb_access_token')
    localStorage.setItem('vturb_current_tab', 'users')

    global.fetch = vi.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = url.toString()
      if (urlStr.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: 'new-token', user: mockUser }),
        })
      }
      if (urlStr.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    })

    await act(async () => {
      render(<App />)
    })

    // Tela de login visível
    expect(screen.getByTestId('login-view-container')).toBeInTheDocument()

    // Preenche credenciais e faz login
    fireEvent.change(screen.getByTestId('login-email-input'), { target: { value: 'admin@vturb.com' } })
    fireEvent.change(screen.getByTestId('login-password-input'), { target: { value: 'Admin123456!' } })

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-submit-btn'))
    })

    // Após autenticação, a aba ativa deve ser obrigatoriamente 'Meus vídeos'
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('page-title')).toHaveTextContent('Meus vídeos')
      expect(screen.getByTestId('nav-meus-videos')).toHaveStyle({ backgroundColor: '#e0f2fe' })
    })
    expect(localStorage.getItem('vturb_current_tab')).toBe('videos')
  })
})
