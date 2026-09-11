import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginView } from '../components/auth/LoginView'

describe('LoginView Component', () => {
  const onLoginSuccessMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renderiza o formulário na coluna esquerda e o visual na coluna direita', () => {
    render(<LoginView onLoginSuccess={onLoginSuccessMock} />)

    // Coluna esquerda (formulário)
    expect(screen.getByTestId('login-form-column')).toBeInTheDocument()
    expect(screen.getByTestId('login-heading')).toHaveTextContent('Bem-vindo de volta')
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit-btn')).toBeInTheDocument()

    // Coluna direita (showcase visual)
    expect(screen.getByTestId('login-image-column')).toBeInTheDocument()
    expect(screen.getByText('Alta Conversão')).toBeInTheDocument()
    expect(screen.getByText('Smart Autoplay Ativo')).toBeInTheDocument()
    expect(screen.getByText('Turbo Autoplay')).toBeInTheDocument()
  })

  it('alterna visibilidade da senha ao clicar no botão de olho', () => {
    render(<LoginView onLoginSuccess={onLoginSuccessMock} />)

    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement
    const toggleBtn = screen.getByTestId('toggle-password-visibility')

    expect(passwordInput.type).toBe('password')

    fireEvent.click(toggleBtn)
    expect(passwordInput.type).toBe('text')

    fireEvent.click(toggleBtn)
    expect(passwordInput.type).toBe('password')
  })

  it('exibe erro de validação se tentar enviar com campos vazios', async () => {
    render(<LoginView onLoginSuccess={onLoginSuccessMock} />)

    const submitBtn = screen.getByTestId('login-submit-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('login-error-message')).toHaveTextContent(
        'Por favor, preencha o e-mail e a senha.'
      )
    })
    expect(onLoginSuccessMock).not.toHaveBeenCalled()
  })

  it('exibe mensagem de erro quando a API rejeita as credenciais', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'E-mail ou senha incorretos.' }),
      })
    )

    render(<LoginView onLoginSuccess={onLoginSuccessMock} />)

    fireEvent.change(screen.getByTestId('login-email-input'), {
      target: { value: 'errado@vturb.com' },
    })
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: { value: 'senha123' },
    })
    fireEvent.click(screen.getByTestId('login-submit-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('login-error-message')).toHaveTextContent(
        'E-mail ou senha incorretos.'
      )
    })
    expect(onLoginSuccessMock).not.toHaveBeenCalled()
  })

  it('realiza login com sucesso e chama onLoginSuccess', async () => {
    const mockUser = {
      id: 'admin-1',
      email: 'admin@vturb.com',
      is_super_admin: true,
      created_at: new Date().toISOString(),
    }

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'fake-jwt-token-xyz',
            token_type: 'bearer',
            user: mockUser,
          }),
      })
    )

    render(<LoginView onLoginSuccess={onLoginSuccessMock} />)

    fireEvent.change(screen.getByTestId('login-email-input'), {
      target: { value: 'admin@vturb.com' },
    })
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: { value: 'Admin123456!' },
    })
    fireEvent.click(screen.getByTestId('login-submit-btn'))

    await waitFor(() => {
      expect(onLoginSuccessMock).toHaveBeenCalledWith(mockUser)
      expect(localStorage.getItem('vturb_access_token')).toBe('fake-jwt-token-xyz')
    })
  })
})
