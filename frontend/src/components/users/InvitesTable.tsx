import React, { useState, useMemo } from 'react'
import {
  Trash2,
  Copy,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Shield,
  Link,
} from 'lucide-react'
import type { UserInvite } from '../../types/auth'

const ITEMS_PER_PAGE = 20

interface InvitesTableProps {
  invites: UserInvite[]
  onDeleteInvite: (invite: UserInvite) => void
  onBulkDeleteInvites: (inviteIds: string[]) => void
  showToast: (msg: string) => void
}

export const InvitesTable: React.FC<InvitesTableProps> = ({
  invites,
  onDeleteInvite,
  onBulkDeleteInvites,
  showToast,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(invites.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedInvites = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    return invites.slice(start, start + ITEMS_PER_PAGE)
  }, [invites, safeCurrentPage])

  const allCurrentSelected =
    paginatedInvites.length > 0 &&
    paginatedInvites.every((i) => selectedIds.includes(i.id))

  const handleToggleSelectAll = () => {
    if (allCurrentSelected) {
      const currentIds = new Set(paginatedInvites.map((i) => i.id))
      setSelectedIds((prev) => prev.filter((id) => !currentIds.has(id)))
    } else {
      const toAdd = paginatedInvites.map((i) => i.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...toAdd])))
    }
  }

  const handleToggleSelectInvite = (inviteId: string) => {
    setSelectedIds((prev) =>
      prev.includes(inviteId) ? prev.filter((id) => id !== inviteId) : [...prev, inviteId]
    )
  }

  const handleCopyInviteUrl = async (e: React.MouseEvent, token: string) => {
    e.preventDefault()
    e.stopPropagation()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/invite/${token}`

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      setCopiedToken(token)
      showToast('Link do convite copiado para a área de transferência!')
      setTimeout(() => setCopiedToken(null), 3000)
    } catch {
      showToast('Erro ao copiar link do convite.')
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('pt-BR', {
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

  const isExpired = (expiresAt: string) => {
    try {
      return new Date(expiresAt).getTime() < Date.now()
    } catch {
      return false
    }
  }

  return (
    <div data-testid="invites-section">
      {/* Barra de Ações em Lote e Contagem */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            data-testid="btn-select-all-invites"
            onClick={handleToggleSelectAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {allCurrentSelected ? (
              <CheckSquare size={16} color="#0284c7" />
            ) : (
              <Square size={16} color="#64748b" />
            )}
            <span>{allCurrentSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
          </button>

          {selectedIds.length > 0 && (
            <div
              data-testid="bulk-actions-invites-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
              }}
            >
              <span
                data-testid="bulk-count-invites-text"
                style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}
              >
                {selectedIds.length} {selectedIds.length === 1 ? 'convite selecionado' : 'convites selecionados'}
              </span>
              <button
                type="button"
                data-testid="btn-bulk-delete-invites"
                onClick={() => onBulkDeleteInvites(selectedIds)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                }}
              >
                <Trash2 size={15} />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>

        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          {invites.length} {invites.length === 1 ? 'convite registrado' : 'convites registrados'}
        </span>
      </div>

      {/* Card da Tabela */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1.25rem', width: '40px' }}></th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Link do Convite
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Função
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Expiração
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvites.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Nenhum convite gerado. Clique em "Criar Convite" para gerar o primeiro.
                  </td>
                </tr>
              ) : (
                paginatedInvites.map((invite) => {
                  const isChecked = selectedIds.includes(invite.id)
                  const expired = isExpired(invite.expires_at)
                  const isCopied = copiedToken === invite.token

                  return (
                    <tr
                      key={invite.id}
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
                          onClick={() => handleToggleSelectInvite(invite.id)}
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
                            onClick={(e) => handleCopyInviteUrl(e, invite.token)}
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
                            backgroundColor: invite.role === 'admin' ? '#e0f2fe' : '#f1f5f9',
                            color: invite.role === 'admin' ? '#0284c7' : '#475569',
                            border: invite.role === 'admin' ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                            letterSpacing: '0.02em',
                          }}
                        >
                          <Shield size={13} />
                          <span>{invite.role === 'admin' ? 'ADMIN' : 'USUÁRIO'}</span>
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
                        {invite.is_used ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            Utilizado
                          </span>
                        ) : expired ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                            }}
                          >
                            Expirado
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                            }}
                          >
                            Disponível
                          </span>
                        )}
                      </td>

                      {/* Coluna Ações */}
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          data-testid={`btn-delete-invite-${invite.id}`}
                          onClick={() => onDeleteInvite(invite)}
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div
            data-testid="invites-pagination"
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Página {safeCurrentPage} de {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                data-testid="pagination-invites-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: safeCurrentPage === 1 ? '#94a3b8' : '#334155',
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                data-testid="pagination-invites-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: safeCurrentPage === totalPages ? '#94a3b8' : '#334155',
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <span>Próximo</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
