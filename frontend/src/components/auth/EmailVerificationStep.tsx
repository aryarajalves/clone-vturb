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
    <div data-testid="email-verification-step">
      {/* Ícone e Cabeçalho de Verificação */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem',
            borderRadius: '16px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}
        >
          <Mail size={28} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
          Verifique seu e-mail
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
          Enviamos um código de segurança de 6 dígitos para o endereço:
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#1e293b',
          }}
        >
          {email}
        </div>
      </div>

      {/* Banner de Erro */}
      {errorMessage && (
        <div
          data-testid="verification-error-message"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            padding: '0.85rem 1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="verification-code-input"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
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
            autoFocus
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '1.85rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.4em',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '2px solid #cbd5e1',
              outline: 'none',
              color: '#0f172a',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
            O código expira em 15 minutos. Verifique também a pasta de spam.
          </p>
        </div>

        <button
          type="submit"
          data-testid="confirm-verification-button"
          disabled={code.trim().length !== 6 || submitting}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: code.trim().length !== 6 || submitting ? '#94a3b8' : '#059669',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: 'none',
            cursor: code.trim().length !== 6 || submitting ? 'not-allowed' : 'pointer',
            boxShadow: code.trim().length !== 6 || submitting ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
            marginBottom: '1.25rem',
            transition: 'all 0.2s',
          }}
        >
          {submitting ? (
            <span>Validando e criando conta...</span>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Confirmar e Criar Conta</span>
            </>
          )}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.85rem',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            <span>Corrigir e-mail</span>
          </button>

          <button
            type="button"
            data-testid="resend-code-button"
            onClick={handleResendClick}
            disabled={!canResend || resending || submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: !canResend || resending || submitting ? '#94a3b8' : '#059669',
              background: 'none',
              border: 'none',
              cursor: !canResend || resending || submitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              padding: 0,
            }}
          >
            <RefreshCw size={15} />
            <span>{canResend ? 'Reenviar código' : `Reenviar em ${countdown}s`}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
