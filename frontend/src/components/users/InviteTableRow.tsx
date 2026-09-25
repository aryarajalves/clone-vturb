import React from 'react'
import { Trash2, Copy, Clock, Check, CheckSquare, Square, Shield, Link } from 'lucide-react'
import type { UserInvite } from '../../types/auth'
import { formatDate, isExpired, getRoleBadge, getStatusBadge } from './inviteFormatters'

interface InviteTableRowProps {
  invite: UserInvite
  isChecked: boolean
  isCopied: boolean
  onToggleSelect: (id: string) => void
  onCopyUrl: (e: React.MouseEvent, token: string) => void
  onDelete: (invite: UserInvite) => void
}

export const InviteTableRow: React.FC<InviteTableRowProps> = ({
  invite,
  isChecked,
  isCopied,
  onToggleSelect,
  onCopyUrl,
  onDelete,
}) => {
  const expired = isExpired(invite.expires_at)
  const roleBadge = getRoleBadge(invite.role)
  const statusBadge = getStatusBadge(invite.is_used, expired)

  return (
    <tr
      data-testid={`invite-row-${invite.id}`}
      style={{
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: isChecked ? '#f0f9ff' : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <button
          type="button"
          data-testid={`checkbox-invite-${invite.id}`}
          onClick={() => onToggleSelect(invite.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {isChecked ? <CheckSquare size={18} color="#0284c7" /> : <Square size={18} color="#94a3b8" />}
        </button>
      </td>

      {/* Coluna Link / Token */}
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link size={16} color="#64748b" />
          <code
            style={{
              backgroundColor: '#f1f5f9',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.825rem',
              color: '#334155',
              fontFamily: 'monospace',
            }}
          >
            ...{invite.token.slice(-14)}
          </code>
          <button
            type="button"
            data-testid={`btn-copy-invite-${invite.id}`}
            onClick={(e) => onCopyUrl(e, invite.token)}
            title="Copiar link do convite"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isCopied ? '#16a34a' : '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </td>

      {/* Coluna Função */}
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: roleBadge.bg,
            color: roleBadge.color,
            border: roleBadge.border,
            letterSpacing: '0.02em',
          }}
        >
          <Shield size={13} />
          <span>{roleBadge.label}</span>
        </span>
      </td>

      {/* Coluna Expiração */}
      <td style={{ padding: '0.9rem 1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={14} color="#94a3b8" />
          <span>{formatDate(invite.expires_at)}</span>
        </div>
      </td>

      {/* Coluna Status */}
      <td style={{ padding: '0.9rem 1.25rem' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: statusBadge.bg,
            color: statusBadge.color,
          }}
        >
          {statusBadge.label}
        </span>
      </td>

      {/* Coluna Ações */}
      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
        <button
          type="button"
          data-testid={`btn-delete-invite-${invite.id}`}
          onClick={() => onDelete(invite)}
          title="Excluir convite"
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
          }}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  )
}
