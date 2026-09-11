import React, { useEffect, useState } from 'react'
import {
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

  // Etapa do fluxo: 'form' (dados) ou 'verify' (código de 6 dígitos Brevo)
  const [step, setStep] = useState<'form' | 'verify'>('form')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Estados assíncronos
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

  // Regras de validação de senha forte
  const hasMin12 = password.length >= 12
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]/.test(password)
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
      showToast('Código de verificação enviado para seu e-mail!')
      setVerificationError(null)
      setStep('verify')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar cadastro.'
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
      showToast('Novo código de verificação enviado com sucesso!')
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
        gap: '0.375rem',
        fontSize: '0.75rem',
        color: met ? '#15803d' : '#64748b',
        fontWeight: met ? 600 : 400,
        transition: 'color 0.15s ease',
      }}
    >
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
      )}
      <span>{label}</span>
    </div>
  )

  if (validating) {
    return (
      <div
        data-testid="invite-loading-screen"
        className="min-h-screen flex items-center justify-center bg-slate-50 p-4"
      >
        <div className="text-center text-slate-500 space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-base font-semibold text-slate-800">
            Validando link de convite...
          </div>
          <div className="text-xs text-slate-400">Por favor, aguarde um momento.</div>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div
        data-testid="invite-error-screen"
        className="min-h-screen flex items-center justify-center bg-slate-50 p-4"
      >
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <XCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Convite Inválido ou Expirado</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{errorMessage}</p>
          <div className="pt-2">
            <a
              href="/login"
              data-testid="btn-back-to-login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Ir para tela de login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" data-testid="accept-invite-view">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Perfil: {validation?.role === 'admin' ? 'Administrador' : 'Usuário'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Criar Minha Conta</h2>
          <p className="text-xs text-slate-500">
            {step === 'form'
              ? 'Preencha seus dados de acesso para começar na plataforma'
              : 'Confirme seu endereço de e-mail para ativar seu acesso'}
          </p>
        </div>

        {/* Passo 2: Verificação do Código Brevo */}
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
          /* Passo 1: Formulário de Cadastro */
          <form onSubmit={handleProceedToVerification} className="space-y-4">
            {/* Banner de Erro de E-mail Duplicado ou validação */}
            {formError && (
              <div
                data-testid="form-error-alert"
                className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Atenção</span>
                  <span>{formError}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Completo (Opcional)
              </label>
              <input
                type="text"
                data-testid="input-invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  data-testid="input-invite-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres com maiúscula, número..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 placeholder:text-slate-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirmar Senha
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                data-testid="input-invite-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-800 placeholder:text-slate-400 transition-all font-mono"
              />
            </div>

            {/* Requisitos de Senha */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Requisitos de Segurança:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando código de validação...</span>
                </>
              ) : (
                <>
                  <span>Criar Minha Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
