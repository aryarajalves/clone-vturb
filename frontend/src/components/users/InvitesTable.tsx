import React, { useState, useMemo, useEffect } from 'react'
import type { UserInvite } from '../../types/auth'
import { InviteTableRow } from './InviteTableRow'
import { InvitesBulkActionsBar } from './InvitesBulkActionsBar'
import { InvitesPagination } from './InvitesPagination'

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

  // Todos os convites do sistema (independente de página)
  const allSelected =
    invites.length > 0 &&
    invites.every((i) => selectedIds.includes(i.id))

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(invites.map((i) => i.id))
    }
  }

  // Sincroniza seleção quando a lista de convites é modificada
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => invites.some((i) => i.id === id)))
  }, [invites])

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

  return (
    <div data-testid="invites-section">
      {/* Barra de Ações em Lote e Contagem */}
      <InvitesBulkActionsBar
        allSelected={allSelected}
        onToggleSelectAll={handleToggleSelectAll}
        selectedCount={selectedIds.length}
        onBulkDelete={() => onBulkDeleteInvites(selectedIds)}
        totalCount={invites.length}
      />

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
                paginatedInvites.map((invite) => (
                  <InviteTableRow
                    key={invite.id}
                    invite={invite}
                    isChecked={selectedIds.includes(invite.id)}
                    isCopied={copiedToken === invite.token}
                    onToggleSelect={handleToggleSelectInvite}
                    onCopyUrl={handleCopyInviteUrl}
                    onDelete={onDeleteInvite}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <InvitesPagination
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
