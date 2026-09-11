import React, { useState } from 'react'
import { X, UserPlus, Copy, Check, Clock, Shield } from 'lucide-react'
import type { UserInvite } from '../../types/auth'
import { createInvite } from '../../services/api'

interface CreateInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInviteCreated: (invite: UserInvite) => void
  showToast: (msg: string) => void
}

export const CreateInviteModal: React.FC<CreateInviteModalProps> = ({
  isOpen,
  onClose,
  onInviteCreated,
  showToast,
}) => {
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [durationHours, setDurationHours] = useState<number>(24)
  const [loading, setLoading] = useState(false)
  const [generatedInvite, setGeneratedInvite] = useState<UserInvite | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const invite = await createInvite({
        role,
        duration_hours: durationHours,
      })
      setGeneratedInvite(invite)
      onInviteCreated(invite)
      showToast('Link de convite gerado com sucesso!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar link de convite.'
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  const getFullInviteUrl = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/invite/${token}`
  }

  const handleCopy = async () => {
    if (!generatedInvite) return
    const url = getFullInviteUrl(generatedInvite.token)
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      showToast('Link copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast('Erro ao copiar link.')
    }
  }

  const handleResetAndClose = () => {
    setGeneratedInvite(null)
    setCopied(false)
    onClose()
  }

  return (
    <div
      data-testid="create-invite-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        data-testid="create-invite-modal-content"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <UserPlus size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#0f172a' }}>
              Novo Convite de Usuário
            </h3>
          </div>
          <button
            type="button"
            data-testid="btn-close-invite-modal"
            onClick={handleResetAndClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div style={{ padding: '1.5rem' }}>
          {generatedInvite ? (
            <div data-testid="invite-generated-box" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#15803d', fontSize: '0.95rem' }}>
                    Convite criado com sucesso!
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                    Função:{' '}
                    <strong style={{ textTransform: 'capitalize' }}>
                      {generatedInvite.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  Link do Convite:
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.6rem 0.8rem',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    data-testid="input-generated-invite-url"
                    value={getFullInviteUrl(generatedInvite.token)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      width: '100%',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    data-testid="btn-copy-invite-link"
                    onClick={handleCopy}
                    style={{
                      backgroundColor: copied ? '#10b981' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      flexShrink: 0,
                      transition: 'background 0.2s',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} />
                <span>
                  Expira em:{' '}
                  {new Date(generatedInvite.expires_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  data-testid="btn-finish-invite"
                  onClick={handleResetAndClose}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Seleção do Tipo de Usuário */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={16} color="#0284c7" />
                  Tipo de Usuário:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    data-testid="role-option-user"
                    onClick={() => setRole('user')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: role === 'user' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: role === 'user' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: role === 'user' ? '#0284c7' : '#1e293b' }}>
                      Usuário
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Acesso padrão ao painel e vídeos
                    </span>
                  </button>

                  <button
                    type="button"
                    data-testid="role-option-admin"
                    onClick={() => setRole('admin')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: role === 'admin' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: role === 'admin' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: role === 'admin' ? '#0284c7' : '#1e293b' }}>
                      Admin
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Gerenciamento e configurações
                    </span>
                  </button>
                </div>
              </div>

              {/* Tempo de Expiração */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} color="#0284c7" />
                  Tempo para Expirar o Link:
                </label>
                <select
                  data-testid="select-expiration-hours"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={1}>1 hora</option>
                  <option value={6}>6 horas</option>
                  <option value={24}>24 horas (1 dia)</option>
                  <option value={48}>48 horas (2 dias)</option>
                  <option value={168}>7 dias (1 semana)</option>
                </select>
              </div>

              {/* Ações */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  data-testid="btn-cancel-invite"
                  onClick={handleResetAndClose}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-create-invite"
                  disabled={loading}
                  style={{
                    padding: '0.65rem 1.35rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {loading ? 'Gerando...' : 'Gerar Link de Convite'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
