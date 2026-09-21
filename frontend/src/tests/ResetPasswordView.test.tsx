import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResetPasswordView } from '../components/auth/ResetPasswordView'
import * as api from '../services/api'

vi.mock('../services/api', () => ({
  validateResetToken: vi.fn(),
  executePasswordReset: vi.fn(),
}))

describe('ResetPasswordView - Tela Pública de Redefinição de Senha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe tela de erro se o token for inválido ou expirado', async () => {
    vi.mocked(api.validateResetToken).mockRejectedValue(new Error('Link de redefinição de senha inválido ou expirado.'))
    const onSuccess = vi.fn()
    const onCancel = vi.fn()
    const showToast = vi.fn()

    render(
      <ResetPasswordView
        token="token-invalido"
        onSuccess={onSuccess}
        onCancel={onCancel}
        showToast={showToast}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-error-screen')).toBeInTheDocument()
      expect(screen.getByText(/Link Inválido ou Expirado/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('btn-back-to-login'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('valida token com sucesso, exibe formulário, valida senha forte e conclui redefinição', async () => {
    vi.mocked(api.validateResetToken).mockResolvedValue({
      valid: true,
      email: 'usuario.teste@vturb.com',
      name: 'Usuário Teste',
    })
    vi.mocked(api.executePasswordReset).mockResolvedValue({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode entrar com sua nova senha.',
    })
    const onSuccess = vi.fn()
    const onCancel = vi.fn()
    const showToast = vi.fn()

    render(
      <ResetPasswordView
        token="token-valido-123"
        onSuccess={onSuccess}
        onCancel={onCancel}
        showToast={showToast}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-view')).toBeInTheDocument()
      expect(screen.getByText(/usuario.teste@vturb.com/i)).toBeInTheDocument()
    })

    const submitBtn = screen.getByTestId('btn-submit-reset-password')
    expect(submitBtn).toBeDisabled()

    // Digita senha fraca
    fireEvent.change(screen.getByTestId('input-new-password'), { target: { value: '123456' } })
    fireEvent.change(screen.getByTestId('input-confirm-new-password'), { target: { value: '123456' } })
    expect(submitBtn).toBeDisabled()

    // Digita senha forte válida
    fireEvent.change(screen.getByTestId('input-new-password'), { target: { value: 'SenhaForte123!' } })
    fireEvent.change(screen.getByTestId('input-confirm-new-password'), { target: { value: 'SenhaForte123!' } })
    expect(submitBtn).not.toBeDisabled()

    // Submete formulário
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(api.executePasswordReset).toHaveBeenCalledWith('token-valido-123', 'SenhaForte123!')
      expect(showToast).toHaveBeenCalledWith('Sua senha foi redefinida com sucesso! Você já pode entrar com sua nova senha.')
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
