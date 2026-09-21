import React, { useState, useEffect } from 'react'
import { X, UserCheck, Shield, Mail, User, Loader2, KeyRound } from 'lucide-react'
import type { User as UserType } from '../../types/auth'
import { updateUser } from '../../services/api'

interface EditUserModalProps {
  isOpen: boolean
  user: UserType | null
  onClose: () => void
  onUserUpdated: (updatedUser: UserType) => void
  onOpenResetPassword?: (user: UserType) => void
  showToast: (msg: string) => void
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onUserUpdated,
  onOpenResetPassword,
  showToast,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setRole(user.role === 'admin' ? 'admin' : 'user')
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      showToast('O e-mail é obrigatório.')
      return
    }

    try {
      setLoading(true)
      const payload: { name?: string; email?: string; role?: string } = {
        name: name.trim(),
        email: email.trim(),
        role: role,
      }

      const updated = await updateUser(user.id, payload)
      onUserUpdated(updated)
      showToast('Usuário atualizado com sucesso!')
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar usuário.'
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      data-testid="edit-user-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
    >
      <div
        data-testid="edit-user-modal"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho do Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Editar Usuário
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Altere os dados de cadastro e permissões da conta.
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-edit-user-modal"
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Nome */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.45rem',
              }}
            >
              <User size={14} color="#64748b" />
              <span>Nome Completo</span>
            </label>
            <input
              type="text"
              data-testid="input-edit-user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* E-mail */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.45rem',
              }}
            >
              <Mail size={14} color="#64748b" />
              <span>Endereço de E-mail *</span>
            </label>
            <input
              type="email"
              required
              data-testid="input-edit-user-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Função / Perfil */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.45rem',
              }}
            >
              <Shield size={14} color="#64748b" />
              <span>Função no Sistema *</span>
            </label>
            <select
              data-testid="select-edit-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="user">Usuário (Padrão)</option>
              <option value="admin">Administrador (Admin)</option>
            </select>
          </div>

          {/* Botões de Ação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              data-testid="btn-cancel-edit-user"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>

            {onOpenResetPassword && (
              <button
                type="button"
                data-testid="btn-modal-reset-password"
                onClick={() => {
                  onClose()
                  onOpenResetPassword(user)
                }}
                disabled={loading}
                title="Redefinir a senha deste usuário"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <KeyRound size={15} />
                <span>Redefinir Senha</span>
              </button>
            )}

            <button
              type="submit"
              data-testid="btn-save-edit-user"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
