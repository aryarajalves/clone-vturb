import React, { useEffect, useState } from 'react'
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { validateResetToken, executePasswordReset, type ValidateResetTokenResult } from '../../services/api'

interface ResetPasswordViewProps {
  token: string
  onSuccess: () => void
  onCancel: () => void
  showToast: (msg: string) => void
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  token,
  onSuccess,
  onCancel,
  showToast,
}) => {
  const [validation, setValidation] = useState<ValidateResetTokenResult | null>(null)
  const [validating, setValidating] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const checkToken = async () => {
      try {
        setValidating(true)
        const data = await validateResetToken(token)
        setValidation(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Link de redefinição de senha inválido ou expirado.'
        setErrorMessage(msg)
      } finally {
        setValidating(false)
      }
    }

    if (token) {
      checkToken()
    } else {
      setErrorMessage('Token de redefinição ausente.')
      setValidating(false)
    }
  }, [token])

  const passwordChecks = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~]/.test(password),
  }

  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!isPasswordValid) {
      setFormError('A nova senha não atende a todos os critérios de segurança.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('As senhas digitadas não coincidem.')
      return
    }

    try {
      setSubmitting(true)
      const res = await executePasswordReset(token, password)
      showToast(res.message || 'Senha redefinida com sucesso!')
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao redefinir a senha.'
      setFormError(msg)
      showToast(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (validating) {
    return (
      <div
        data-testid="reset-password-validating"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          gap: '1rem',
        }}
      >
        <Loader2 size={36} className="animate-spin" color="#0284c7" />
        <p style={{ fontSize: '1rem', color: '#94a3b8' }}>Validando link de redefinição...</p>
      </div>
    )
  }

  if (errorMessage || !validation) {
    return (
      <div
        data-testid="reset-password-error-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid #334155',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#ef4444',
            }}
          >
            <XCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
            Link Inválido ou Expirado
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
            {errorMessage || 'Este link de redefinição de senha já foi utilizado ou sua validade expirou.'}
          </p>
          <button
            type="button"
            data-testid="btn-back-to-login"
            onClick={onCancel}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="reset-password-view"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem' }}>
            Criar Nova Senha
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Defina uma nova senha para a conta <strong>{validation.email}</strong>
          </p>
        </div>

        {formError && (
          <div
            data-testid="reset-password-form-error"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nova Senha */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Nova Senha *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                data-testid="input-new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a nova senha segura"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.7rem 2.5rem 0.7rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Confirmar Nova Senha *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              data-testid="input-confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Checklist de Validação de Senha Forte */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
              Requisitos de Segurança da Senha:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: passwordChecks.length ? '#16a34a' : '#94a3b8' }}>
                <CheckCircle2 size={13} color={passwordChecks.length ? '#16a34a' : '#cbd5e1'} />
                <span>Mínimo de 12 caracteres</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: passwordChecks.upper ? '#16a34a' : '#94a3b8' }}>
                <CheckCircle2 size={13} color={passwordChecks.upper ? '#16a34a' : '#cbd5e1'} />
                <span>Pelo menos uma letra maiúscula</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: passwordChecks.lower ? '#16a34a' : '#94a3b8' }}>
                <CheckCircle2 size={13} color={passwordChecks.lower ? '#16a34a' : '#cbd5e1'} />
                <span>Pelo menos uma letra minúscula</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: passwordChecks.number ? '#16a34a' : '#94a3b8' }}>
                <CheckCircle2 size={13} color={passwordChecks.number ? '#16a34a' : '#cbd5e1'} />
                <span>Pelo menos um número</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: passwordChecks.special ? '#16a34a' : '#94a3b8' }}>
                <CheckCircle2 size={13} color={passwordChecks.special ? '#16a34a' : '#cbd5e1'} />
                <span>Pelo menos um caractere especial (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            data-testid="btn-submit-reset-password"
            disabled={submitting || !isPasswordValid || password !== confirmPassword}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: submitting || !isPasswordValid || password !== confirmPassword ? '#94a3b8' : '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: submitting || !isPasswordValid || password !== confirmPassword ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isPasswordValid && password === confirmPassword ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Salvando nova senha...</span>
              </>
            ) : (
              <>
                <span>Salvar Nova Senha</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

