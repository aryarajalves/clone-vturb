import React from 'react'
import {
  Trash2,
  Pencil,
  Lock,
  CheckSquare,
  Square,
  Shield,
  ShieldAlert,
  KeyRound,
} from 'lucide-react'
import type { User } from '../../types/auth'

interface UserTableRowProps {
  user: User
  currentUser: User | null
  isSelected: boolean
  isSelectable: boolean
  onToggleSelect: (userId: string) => void
  onEdit: (user: User) => void
  onResetPassword: (user: User) => void
  onDelete: (user: User) => void
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  currentUser,
  isSelected,
  isSelectable,
  onToggleSelect,
  onEdit,
  onResetPassword,
  onDelete,
}) => {
  const isSuper = user.is_super_admin || user.role === 'super_admin'
  const initial = (user.name?.charAt(0) || user.email.charAt(0) || 'U').toUpperCase()

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getRoleBadge = () => {
    if (isSuper) {
      return {
        label: 'SUPER ADMIN',
        bg: '#f3e8ff',
        color: '#7e22ce',
        border: '1px solid #d8b4fe',
      }
    }
    if (user.role === 'admin') {
      return {
        label: 'ADMIN',
        bg: '#e0f2fe',
        color: '#0284c7',
        border: '1px solid #bae6fd',
      }
    }
    return {
      label: 'USUÁRIO',
      bg: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0',
    }
  }

  const badge = getRoleBadge()

  return (
    <tr
      data-testid={`user-row-${user.id}`}
      style={{
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      {/* Checkbox de Seleção */}
      <td style={{ padding: '0.9rem 1.25rem' }}>
        {isSelectable ? (
          <button
            type="button"
            data-testid={`checkbox-user-${user.id}`}
            onClick={() => onToggleSelect(user.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {isSelected ? <CheckSquare size={18} color="#0284c7" /> : <Square size={18} color="#94a3b8" />}
          </button>
        ) : (
          <span data-testid={`protected-user-${user.id}`} title="Conta protegida">
            <Lock size={16} color="#94a3b8" />
          </span>
        )}
      </td>

      {/* Identificação do Usuário */}
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isSuper
                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                : 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                {user.email}
              </span>
              {currentUser && user.id === currentUser.id && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '6px',
                  }}
                >
                  Você
                </span>
              )}
            </div>
            {user.name && (
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {user.name}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Função / Role Badge */}
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <span
          data-testid={`badge-role-${user.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: badge.bg,
            color: badge.color,
            border: badge.border,
            letterSpacing: '0.02em',
          }}
        >
          {isSuper ? <ShieldAlert size={13} /> : <Shield size={13} />}
          <span>{badge.label}</span>
        </span>
      </td>

      {/* Data de Criação */}
      <td style={{ padding: '0.9rem 1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
        {formatDate(user.created_at)}
      </td>

      {/* Ações: Editar e Excluir */}
      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSelectable ? (
            <>
              {/* Botão de Edição de Usuário */}
              <button
                type="button"
                data-testid={`btn-edit-user-${user.id}`}
                onClick={() => onEdit(user)}
                title="Editar usuário"
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Pencil size={15} />
              </button>

              {/* Botão de Redefinir Senha */}
              <button
                type="button"
                data-testid={`btn-reset-password-${user.id}`}
                onClick={() => onResetPassword(user)}
                title="Redefinir senha"
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <KeyRound size={15} />
              </button>

              {/* Botão de Exclusão de Usuário */}
              <button
                type="button"
                data-testid={`btn-delete-user-${user.id}`}
                onClick={() => onDelete(user)}
                title="Excluir usuário"
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                color: '#94a3b8',
                fontWeight: 500,
              }}
            >
              <Lock size={14} />
              <span>Protegido</span>
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}
