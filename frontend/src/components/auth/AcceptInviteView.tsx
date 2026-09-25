import React, { useEffect, useState } from 'react'
import {
  Play,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import type { InviteValidation } from '../../types/auth'
import { validateInvite, registerViaInvite, sendVerificationCode } from '../../services/api'
import { EmailVerificationStep } from './EmailVerificationStep'
import { styles } from './acceptInviteStyles'

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

  const [step, setStep] = useState<'form' | 'verify'>('form')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

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

  const hasMin12 = password.length >= 12
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const isPasswordStrong = hasMin12 && hasUpper && hasLower && hasNumber && hasSpecial

  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim() || !email.includes('@')) {
      const msg = 'Por favor, informe um endereço de e-mail válido.'
      setFormError(msg)
      showToast(msg)
      return
    }

    if (!isPasswordStrong) {
      const msg = 'A senha não cumpre todos os requisitos de segurança.'
      setFormError(msg)
      showToast(msg)
      return
    }

    if (!passwordsMatch) {
      const msg = 'As senhas não coincidem.'
      setFormError(msg)
      showToast(msg)
      return
    }

    try {
      setSubmitting(true)
      await sendVerificationCode({
        token,
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
      })
      showToast('Código de verificação enviado para seu e-mail.')
      setStep('verify')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar código de verificação.'
      setFormError(msg)
      showToast(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setResending(true)
      setVerificationError(null)
      await sendVerificationCode({
        token,
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
      })
      showToast('Novo código enviado com sucesso!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao reenviar código.'
      setVerificationError(msg)
      showToast(msg)
    } finally {
      setResending(false)
    }
  }

  const handleVerifyAndCreateAccount = async (code: string) => {
    try {
      setSubmitting(true)
      setVerificationError(null)
      await registerViaInvite({
        token,
        email: email.trim().toLowerCase(),
        password,
        code,
        name: name.trim() || undefined,
      })
      showToast('Conta criada com sucesso! Redirecionando...')
      setTimeout(() => {
        onSuccess()
      }, 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Código de verificação inválido ou expirado.'
      setVerificationError(msg)
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
        gap: '0.35rem',
        fontSize: '0.75rem',
        color: met ? '#15803d' : '#64748b',
        fontWeight: met ? 600 : 400,
        transition: 'color 0.15s ease',
        lineHeight: 1.2,
      }}
    >
      {met ? (
        <CheckCircle2 size={14} color="#16a34a" style={{ flexShrink: 0 }} />
      ) : (
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #cbd5e1', flexShrink: 0 }} />
      )}
      <span>{label}</span>
    </div>
  )

  if (validating) {
    return (
      <div data-testid="invite-loading-screen" style={styles.container}>
        <div style={{ textAlign: 'center', margin: 'auto 0' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #10b981',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem',
            }}
          />
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
            Validando link de convite...
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Por favor, aguarde um momento.</div>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div data-testid="invite-error-screen" style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <XCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Convite Inválido ou Expirado
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
            {errorMessage}
          </p>
          <a
            href="/login"
            data-testid="btn-back-to-login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            Ir para tela de login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="accept-invite-view" style={styles.container}>
      <div style={styles.card}>
        {/* Logo Clone VTurb */}
        <div style={styles.logoRow}>
          <div style={styles.logoBadge}>
            <Play size={16} color="#ffffff" fill="#ffffff" style={{ marginLeft: '2px' }} />
          </div>
          <span style={styles.logoText}>Smart VSL</span>
        </div>

        {/* Header com Papel e Título */}
        <div style={styles.headerArea}>
          <div style={styles.roleBadgeWrapper}>
            <div style={styles.roleBadge}>
              <ShieldCheck size={14} />
              <span>Perfil: {validation?.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
            </div>
          </div>
          <h1 style={styles.title}>Criar Minha Conta</h1>
          <p style={styles.subtitle}>
            {step === 'form'
              ? 'Preencha seus dados de acesso para começar na plataforma'
              : 'Confirme seu endereço de e-mail para ativar seu acesso'}
          </p>
        </div>

        {step === 'verify' ? (
          <EmailVerificationStep
            email={email}
            onVerify={handleVerifyAndCreateAccount}
            onResend={handleResendCode}
            onBack={() => {
              setStep('form')
              setFormError(null)
            }}
            submitting={submitting}
            resending={resending}
            errorMessage={verificationError}
          />
        ) : (
          <form onSubmit={handleProceedToVerification}>
            {formError && (
              <div data-testid="form-error-alert" style={styles.errorAlert}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Atenção</span>
                  <span>{formError}</span>
                </div>
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nome Completo (Opcional)</label>
              <input
                type="text"
                data-testid="input-invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>E-mail</label>
              <input
                type="email"
                required
                data-testid="input-invite-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formError) setFormError(null)
                }}
                placeholder="seu@email.com"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  data-testid="input-invite-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres com maiúscula, número..."
                  style={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirmar Senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                data-testid="input-invite-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                style={styles.input}
              />
            </div>

            {/* Requisitos de Senha em 2 colunas */}
            <div style={styles.reqBox}>
              <div style={styles.reqTitle}>Requisitos de Segurança:</div>
              <div style={styles.reqGrid}>
                {renderRequirement('Mínimo 12 caracteres', hasMin12, 'req-min-12')}
                {renderRequirement('Letra maiúscula (A-Z)', hasUpper, 'req-upper')}
                {renderRequirement('Letra minúscula (a-z)', hasLower, 'req-lower')}
                {renderRequirement('Número (0-9)', hasNumber, 'req-number')}
                {renderRequirement('Caractere especial (!@#$...)', hasSpecial, 'req-special')}
                {renderRequirement('Senhas coincidem', passwordsMatch, 'req-match')}
              </div>
            </div>

            <button
              type="submit"
              data-testid="btn-submit-invite-register"
              disabled={!isPasswordStrong || !passwordsMatch || submitting}
              style={{
                ...styles.submitButton,
                backgroundColor: !isPasswordStrong || !passwordsMatch || submitting ? '#94a3b8' : '#059669',
                cursor: !isPasswordStrong || !passwordsMatch || submitting ? 'not-allowed' : 'pointer',
                boxShadow: !isPasswordStrong || !passwordsMatch || submitting ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              {submitting ? (
                <span>Enviando código de validação...</span>
              ) : (
                <>
                  <span>Criar Minha Conta</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
