import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AcceptInviteView } from '../components/auth/AcceptInviteView'
import * as api from '../services/api'
import type { LoginResponse } from '../types/auth'

vi.mock('../services/api', () => ({
  validateInvite: vi.fn(),
  registerViaInvite: vi.fn(),
}))

describe('AcceptInviteView - Cadastro via Convite', () => {
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

  it('valida em tempo real os 5 requisitos de senha forte e bloqueia submissão inválida', async () => {
    vi.mocked(api.validateInvite).mockResolvedValue({
      valid: true,
      role: 'admin',
      expires_at: '2026-09-12T12:00:00Z',
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

    // 1. Senha curta: "Ab1!" (4 chars) -> não atinge 12 caracteres
    fireEvent.change(passInput, { target: { value: 'Ab1!' } })
    fireEvent.change(confirmInput, { target: { value: 'Ab1!' } })

    expect(screen.getByTestId('req-min-12')).not.toHaveStyle({ color: '#15803d' })
    expect(submitBtn).toBeDisabled()

    // 2. Senha sem maiúscula: "minuscula123!@#" (15 chars)
    fireEvent.change(passInput, { target: { value: 'minuscula123!@#' } })
    fireEvent.change(confirmInput, { target: { value: 'minuscula123!@#' } })
    expect(screen.getByTestId('req-upper')).not.toHaveStyle({ color: '#15803d' })
    expect(submitBtn).toBeDisabled()

    // 3. Senha sem minúscula: "MAIUSCULA123!@#" (15 chars)
    fireEvent.change(passInput, { target: { value: 'MAIUSCULA123!@#' } })
    fireEvent.change(confirmInput, { target: { value: 'MAIUSCULA123!@#' } })
    expect(screen.getByTestId('req-lower')).not.toHaveStyle({ color: '#15803d' })
    expect(submitBtn).toBeDisabled()

    // 4. Senha sem número: "SemNumerosAqui!@#"
    fireEvent.change(passInput, { target: { value: 'SemNumerosAqui!@#' } })
    fireEvent.change(confirmInput, { target: { value: 'SemNumerosAqui!@#' } })
    expect(screen.getByTestId('req-number')).not.toHaveStyle({ color: '#15803d' })
    expect(submitBtn).toBeDisabled()

    // 5. Senha sem caractere especial: "SemEspecial123456"
    fireEvent.change(passInput, { target: { value: 'SemEspecial123456' } })
    fireEvent.change(confirmInput, { target: { value: 'SemEspecial123456' } })
    expect(screen.getByTestId('req-special')).not.toHaveStyle({ color: '#15803d' })
    expect(submitBtn).toBeDisabled()

    // 6. Senha forte mas confirmação diferente
    fireEvent.change(passInput, { target: { value: 'SenhaForte123!@#' } })
    fireEvent.change(confirmInput, { target: { value: 'OutraSenha123!@#' } })
    expect(screen.getByTestId('req-match')).not.toHaveStyle({ color: '#15803d' })
    expect(submitBtn).toBeDisabled()

    // 7. Todos os requisitos satisfeitos
    fireEvent.change(confirmInput, { target: { value: 'SenhaForte123!@#' } })
    expect(screen.getByTestId('req-min-12')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-upper')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-lower')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-number')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-special')).toHaveStyle({ color: '#15803d' })
    expect(screen.getByTestId('req-match')).toHaveStyle({ color: '#15803d' })
    expect(submitBtn).not.toBeDisabled()

    // Submissão com sucesso
    const mockAuthResponse: LoginResponse = {
      access_token: 'token-retornado-jwt',
      token_type: 'bearer',
      user: {
        id: 'user-novo-1',
        email: 'novo@vturb.com',
        role: 'admin',
        is_super_admin: false,
        created_at: '2026-09-11T12:00:00Z',
      },
    }
    vi.mocked(api.registerViaInvite).mockResolvedValue(mockAuthResponse)

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(api.registerViaInvite).toHaveBeenCalledWith({
        token: 'token-valido-123',
        email: 'novo@vturb.com',
        password: 'SenhaForte123!@#',
      })
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Conta criada com sucesso'))
    })
  })
})
