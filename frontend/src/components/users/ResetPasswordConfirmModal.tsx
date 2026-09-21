import React, { useState } from 'react'
import { KeyRound, Check, Copy, Loader2 } from 'lucide-react'
import type { User } from '../../types/auth'
import { triggerUserPasswordReset, type ResetPasswordTriggerResult } from '../../services/api'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

interface ResetPasswordConfirmModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  showToast: (msg: string) => void
}

export const ResetPasswordConfirmModal: React.FC<ResetPasswordConfirmModalProps> = ({
  isOpen,
  user,
  onClose,
  showToast,
}) => {
  useLockBodyScroll(isOpen)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResetPasswordTriggerResult | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen || !user) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      const res = await triggerUserPasswordReset(user.id)
      setResult(res)
      showToast('Instruções de redefinição de senha geradas com sucesso!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao redefinir senha do usuário.'
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    const fullUrl = `${window.location.origin}${result.reset_url}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      showToast('Link de redefinição copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast('Falha ao copiar o link automaticamente.')
    }
  }

  const handleCloseModal = () => {
    setResult(null)
    setCopied(false)
    onClose()
  }

  return (
    <div
      data-testid="reset-password-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-testid="reset-password-modal-content"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '460px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#ea580c',
          }}
        >
          <KeyRound size={28} />
        </div>

        <h3
          data-testid="reset-password-modal-title"
          style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}
        >
          {result ? 'Link de Redefinição Pronto' : 'Redefinir Senha'}
        </h3>

        {!result ? (
          <>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
              Deseja redefinir a senha do usuário{' '}
              <strong style={{ color: '#0f172a' }}>{user.email}</strong>?
              <br />
              Um link de redefinição com validade de 24 horas será gerado e enviado para o e-mail do usuário.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                data-testid="btn-cancel-reset-password"
                onClick={handleCloseModal}
                disabled={loading}
                style={{
                  padding: '0.65rem 1.35rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                data-testid="btn-confirm-reset-password"
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Gerando link...</span>
                  </>
                ) : (
                  <span>Sim, Redefinir Senha</span>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              O e-mail foi disparado para <strong style={{ color: '#0f172a' }}>{user.email}</strong>. Você também pode copiar o link direto abaixo para enviar ao usuário:
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                marginBottom: '1.5rem',
                gap: '0.5rem',
              }}
            >
              <input
                type="text"
                readOnly
                data-testid="input-generated-reset-url"
                value={`${window.location.origin}${result.reset_url}`}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.85rem',
                  color: '#334155',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                data-testid="btn-copy-reset-url"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: copied ? '#16a34a' : '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                data-testid="btn-close-reset-password-success"
                onClick={handleCloseModal}
                style={{
                  padding: '0.65rem 1.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Concluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

