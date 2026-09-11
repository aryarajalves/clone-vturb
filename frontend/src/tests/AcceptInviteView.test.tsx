import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AcceptInviteView } from '../components/auth/AcceptInviteView'
import * as api from '../services/api'
import type { LoginResponse } from '../types/auth'

vi.mock('../services/api', () => ({
  validateInvite: vi.fn(),
  sendVerificationCode: vi.fn(),
  registerViaInvite: vi.fn(),
}))

describe('AcceptInviteView - Cadastro via Convite e Validação de E-mail Brevo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe tela de erro amigável quando o convite for inválido ou expirado', async () => {
    vi.mocked(api.validateInvite).mockRejectedValue(new Error('Este link de convite expirou.'))
    const onSuccess = vi.fn()
    const showToast = vi.fn()

    render(<AcceptInviteView token="token-invalido" onSuccess={onSuccess} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('invite-error-screen')).toBeInTheDocument()
      expect(screen.getByText('Este link de convite expirou.')).toBeInTheDocument()
      expect(screen.getByTestId('btn-back-to-login')).toBeInTheDocument()
    })
  })

  it('valida requisitos de senha forte, envia código Brevo e avança para a tela de verificação', async () => {
    vi.mocked(api.validateInvite).mockResolvedValue({
      valid: true,
      role: 'admin',
      expires_at: '2026-09-12T12:00:00Z',
    })
    vi.mocked(api.sendVerificationCode).mockResolvedValue({
      message: 'Código de verificação enviado para seu e-mail.',
      email: 'novo@vturb.com',
    })

    const onSuccess = vi.fn()
    const showToast = vi.fn()

    render(<AcceptInviteView token="token-valido-123" onSuccess={onSuccess} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('accept-invite-view')).toBeInTheDocument()
      expect(screen.getByText(/Perfil:/i)).toHaveTextContent('Administrador')
    })

    const emailInput = screen.getByTestId('input-invite-email')
    const passInput = screen.getByTestId('input-invite-password')
    const confirmInput = screen.getByTestId('input-invite-confirm-password')
    const submitBtn = screen.getByTestId('btn-submit-invite-register')

    fireEvent.change(emailInput, { target: { value: 'novo@vturb.com' } })
    fireEvent.change(passInput, { target: { value: 'SenhaForte123!@#' } })
    fireEvent.change(confirmInput, { target: { value: 'SenhaForte123!@#' } })

    expect(screen.getByTestId('req-min-12')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-upper')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-lower')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-number')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-special')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-match')).toHaveStyle({ color: '#15803d' })
    expect(submitBtn).not.toBeDisabled()

    // Clica em Criar Minha Conta -> dispara envio de código Brevo
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(api.sendVerificationCode).toHaveBeenCalledWith({
        token: 'token-valido-123',
        email: 'novo@vturb.com',
        name: undefined,
      })
      // Entra na etapa de código Brevo de 6 dígitos
      expect(screen.getByTestId('email-verification-step')).toBeInTheDocument()
      expect(screen.getByTestId('verification-code-input')).toBeInTheDocument()
    })
  })

  it('informa erro claro e destacado quando o e-mail já está cadastrado no sistema', async () => {
    vi.mocked(api.validateInvite).mockResolvedValue({
      valid: true,
      role: 'user',
      expires_at: '2026-09-12T12:00:00Z',
    })
    vi.mocked(api.sendVerificationCode).mockRejectedValue(
      new Error('Este e-mail já está cadastrado no sistema. Por favor, utilize outro e-mail ou faça login.')
    )

    const onSuccess = vi.fn()
    const showToast = vi.fn()

    render(<AcceptInviteView token="token-valido-123" onSuccess={onSuccess} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('accept-invite-view')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-invite-email'), { target: { value: 'existente@vturb.com' } })
    fireEvent.change(screen.getByTestId('input-invite-password'), { target: { value: 'SenhaForte123!@#' } })
    fireEvent.change(screen.getByTestId('input-invite-confirm-password'), { target: { value: 'SenhaForte123!@#' } })

    fireEvent.click(screen.getByTestId('btn-submit-invite-register'))

    await waitFor(() => {
      expect(screen.getByTestId('form-error-alert')).toBeInTheDocument()
      expect(screen.getByText(/Este e-mail já está cadastrado no sistema/i)).toBeInTheDocument()
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('já está cadastrado'))
    })
  })

  it('completa o fluxo ao digitar o código de 6 dígitos e confirmar', async () => {
    vi.mocked(api.validateInvite).mockResolvedValue({
      valid: true,
      role: 'user',
      expires_at: '2026-09-12T12:00:00Z',
    })
    vi.mocked(api.sendVerificationCode).mockResolvedValue({
      message: 'Código enviado.',
      email: 'novo@vturb.com',
    })
    const mockAuthResponse: LoginResponse = {
      access_token: 'token-jwt-ok',
      token_type: 'bearer',
      user: {
        id: 'new-u-1',
        email: 'novo@vturb.com',
        role: 'user',
        is_super_admin: false,
        created_at: '2026-09-11T12:00:00Z',
      },
    }
    vi.mocked(api.registerViaInvite).mockResolvedValue(mockAuthResponse)

    const onSuccess = vi.fn()
    const showToast = vi.fn()

    render(<AcceptInviteView token="token-valido-123" onSuccess={onSuccess} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('accept-invite-view')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('input-invite-email'), { target: { value: 'novo@vturb.com' } })
    fireEvent.change(screen.getByTestId('input-invite-password'), { target: { value: 'SenhaForte123!@#' } })
    fireEvent.change(screen.getByTestId('input-invite-confirm-password'), { target: { value: 'SenhaForte123!@#' } })

    fireEvent.click(screen.getByTestId('btn-submit-invite-register'))

    await waitFor(() => {
      expect(screen.getByTestId('email-verification-step')).toBeInTheDocument()
    })

    // Digita o código de 6 dígitos
    const codeInput = screen.getByTestId('verification-code-input')
    fireEvent.change(codeInput, { target: { value: '123456' } })

    // Clica em confirmar
    const confirmBtn = screen.getByTestId('confirm-verification-button')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(api.registerViaInvite).toHaveBeenCalledWith({
        token: 'token-valido-123',
        email: 'novo@vturb.com',
        password: 'SenhaForte123!@#',
        code: '123456',
        name: undefined,
      })
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Conta criada com sucesso'))
    })
  })
})
