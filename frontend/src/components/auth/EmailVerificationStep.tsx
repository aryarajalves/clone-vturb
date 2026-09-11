import React, { useState, useEffect } from 'react'
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface EmailVerificationStepProps {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  submitting: boolean
  resending: boolean
  errorMessage?: string | null
}

export const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({
  email,
  onVerify,
  onResend,
  onBack,
  submitting,
  resending,
  errorMessage,
}) => {
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResendClick = async () => {
    if (!canResend || resending) return
    await onResend()
    setCountdown(60)
    setCanResend(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().length !== 6 || submitting) return
    await onVerify(code.trim())
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(val)
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="email-verification-step">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950/20">
          <Mail className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Verifique seu e-mail</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          Enviamos um código de segurança de 6 dígitos para o endereço:
        </p>
        <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
          {email}
        </div>
      </div>

      {errorMessage && (
        <div
          data-testid="verification-error-message"
          className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="verification-code-input"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center"
          >
            Digite o código de 6 dígitos
          </label>
          <input
            id="verification-code-input"
            data-testid="verification-code-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            className="w-full text-center text-3xl font-mono font-bold tracking-[0.4em] px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-300 placeholder:tracking-[0.4em]"
            autoFocus
          />
          <p className="text-[11px] text-slate-600 text-center mt-2">
            O código expira em 15 minutos. Verifique também a pasta de spam.
          </p>
        </div>

        <button
          type="submit"
          data-testid="confirm-verification-button"
          disabled={code.trim().length !== 6 || submitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Validando e criando conta...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e Criar Conta</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Corrigir e-mail
          </button>

          <button
            type="button"
            data-testid="resend-code-button"
            onClick={handleResendClick}
            disabled={!canResend || resending || submitting}
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 font-semibold transition-colors disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {canResend ? 'Reenviar código' : `Reenviar em ${countdown}s`}
          </button>
        </div>
      </form>
    </div>
  )
}
