import React, { useEffect, useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Play,
  ArrowRight,
  UserCheck,
} from 'lucide-react'
import type { InviteValidation } from '../../types/auth'
import { validateInvite, registerViaInvite } from '../../services/api'

interface AcceptInviteViewProps {
  token: string
  onSuccess: () => void
  showToast: (msg: string) => void
}

export const AcceptInviteView: React.FC<AcceptInviteViewProps> = ({
  token,
  onSuccess,
  showToast,
}) => {
  const [validation, setValidation] = useState<InviteValidation | null>(null)
  const [validating, setValidating] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkToken = async () => {
      try {
        setValidating(true)
        const data = await validateInvite(token)
        setValidation(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Link de convite inválido ou expirado.'
        setErrorMessage(msg)
      } finally {
        setValidating(false)
      }
    }

    if (token) {
      checkToken()
    } else {
      setErrorMessage('Token de convite não fornecido.')
      setValidating(false)
    }
  }, [token])

  // Regras de validação de senha forte
  const hasMin12 = password.length >= 12
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const isPasswordStrong = hasMin12 && hasUpper && hasLower && hasNumber && hasSpecial

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong) {
      showToast('A senha não cumpre todos os requisitos de segurança.')
      return
    }

    if (!passwordsMatch) {
      showToast('As senhas não coincidem.')
      return
    }

    try {
      setSubmitting(true)
      await registerViaInvite({
        token,
        email: email.trim().toLowerCase(),
        password,
      })
      showToast('Conta criada com sucesso! Redirecionando...')
      setTimeout(() => {
        onSuccess()
      }, 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao concluir cadastro.'
      showToast(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const renderRequirement = (label: string, met: boolean, testId: string) => (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.8rem',
        color: met ? '#15803d' : '#64748b',
        fontWeight: met ? 600 : 400,
        transition: 'color 0.15s ease',
      }}
    >
      {met ? <CheckCircle2 size={14} color="#16a34a" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />}
      <span>{label}</span>
    </div>
  )

  if (validating) {
    return (
      <div
        data-testid="invite-loading-screen"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
            Validando link de convite...
          </div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Por favor, aguarde um momento.
          </div>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div
        data-testid="invite-error-screen"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            border: '1px solid #fee2e2',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', color: '#0f172a', fontWeight: 700 }}>
            Convite Indisponível
          </h2>
          <p style={{ margin: '0 0 1.75rem', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {errorMessage}
          </p>
          <button
            type="button"
            data-testid="btn-back-to-login"
            onClick={() => (window.location.href = '/')}
            style={{
              width: '100%',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.8rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ir para a Tela de Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="accept-invite-view"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2.5rem 1rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 2.25rem',
          boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          margin: 'auto 0',
          boxSizing: 'border-box',
        }}
      >
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.65rem',
            }}
          >
            <Play size={13} fill="#dc2626" />
            <span>Clone do VTurb</span>
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
            Ativação de Conta
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Crie sua conta para acessar o painel do VTurb.
          </p>

          {validation && (
            <div
              style={{
                marginTop: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                padding: '0.35rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <UserCheck size={14} />
              <span>
                Perfil:{' '}
                <strong style={{ textTransform: 'capitalize' }}>
                  {validation.role === 'admin' ? 'Administrador' : 'Usuário'}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Formulário de Cadastro */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* E-mail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Seu E-mail
            </label>
            <input
              type="email"
              required
              data-testid="input-invite-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@seuemail.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Senha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Senha de Acesso
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                data-testid="input-invite-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Confirmar Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              data-testid="input-invite-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Checklist Dinâmico de Requisitos de Senha */}
          <div
            data-testid="password-requirements-box"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              Requisitos de Segurança da Senha:
            </div>
            {renderRequirement('No mínimo 12 caracteres', hasMin12, 'req-min-12')}
            {renderRequirement('Pelo menos uma letra maiúscula (A-Z)', hasUpper, 'req-upper')}
            {renderRequirement('Pelo menos uma letra minúscula (a-z)', hasLower, 'req-lower')}
            {renderRequirement('Pelo menos um número (0-9)', hasNumber, 'req-number')}
            {renderRequirement('Pelo menos um caractere especial (!@#$%^&*)', hasSpecial, 'req-special')}
            {renderRequirement('As senhas são idênticas', passwordsMatch, 'req-match')}
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            data-testid="btn-submit-invite-register"
            disabled={submitting || !isPasswordStrong || !passwordsMatch || !email}
            style={{
              width: '100%',
              backgroundColor: isPasswordStrong && passwordsMatch && email ? '#0284c7' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isPasswordStrong && passwordsMatch && email && !submitting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isPasswordStrong && passwordsMatch ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
              transition: 'all 0.2s ease',
              marginTop: '0.2rem',
            }}
          >
            {submitting ? 'Criando Conta...' : 'Criar Minha Conta'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}

