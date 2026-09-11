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
  MinusSquare,
  ShieldCheck,
  User as UserIcon,
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

  const someCurrentSelected =
    paginatedInvites.some((i) => selectedIds.includes(i.id)) && !allCurrentSelected

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

  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return
    onBulkDeleteInvites(selectedIds)
  }

  return (
    <div className="space-y-4" data-testid="invites-section">
      {/* Barra de Ações em Lote */}
      {selectedIds.length > 0 && (
        <div
          data-testid="bulk-actions-invites-bar"
          className="flex items-center justify-between px-4 py-3 bg-red-950/40 border border-red-500/40 rounded-xl backdrop-blur-md animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm font-medium text-red-200">
              {selectedIds.length} {selectedIds.length === 1 ? 'convite selecionado' : 'convites selecionados'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Desmarcar todos
            </button>
            <button
              onClick={handleExecuteBulkDelete}
              data-testid="btn-bulk-delete-invites"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg shadow-lg shadow-red-900/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir selecionados ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Convites */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm">
        <table className="w-full text-left border-collapse text-sm" data-testid="invites-table">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <th className="w-12 px-4 py-3.5 text-center">
                <button
                  onClick={handleToggleSelectAll}
                  data-testid="btn-select-all-invites"
                  disabled={paginatedInvites.length === 0}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={allCurrentSelected ? 'Desmarcar todos da página' : 'Selecionar todos da página'}
                >
                  {allCurrentSelected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : someCurrentSelected ? (
                    <MinusSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3.5">Função do Convite</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Criado em</th>
              <th className="px-4 py-3.5">Expira em</th>
              <th className="px-4 py-3.5">Link</th>
              <th className="px-4 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedInvites.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  Nenhum convite gerado. Clique em &ldquo;Criar Convite&rdquo; para convidar alguém.
                </td>
              </tr>
            ) : (
              paginatedInvites.map((invite) => {
                const isSelected = selectedIds.includes(invite.id)
                const isExpired = new Date(invite.expires_at) < new Date()
                const isCopied = copiedToken === invite.token

                return (
                  <tr
                    key={invite.id}
                    data-testid={`invite-row-${invite.id}`}
                    className={`transition-colors ${
                      isSelected ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleSelectInvite(invite.id)}
                        data-testid={`checkbox-invite-${invite.id}`}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      {invite.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full">
                          <UserIcon className="w-3 h-3 text-zinc-400" />
                          USUÁRIO
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {invite.is_used ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded">
                          Usado por {invite.used_by_email || 'usuário'}
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                          Expirado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          Ativo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-zinc-400 text-xs">
                      {new Date(invite.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-zinc-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>
                          {new Date(invite.expires_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyInviteUrl(e, invite.token)}
                        data-testid={`btn-copy-invite-${invite.id}`}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10'
                        }`}
                        title="Copiar link do convite"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            Copiar Link
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onDeleteInvite(invite)}
                        data-testid={`btn-delete-invite-${invite.id}`}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir convite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé com Paginação de 20 itens */}
      {invites.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-zinc-400" data-testid="invites-pagination">
          <div>
            Mostrando{' '}
            <span className="font-semibold text-white">
              {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            a{' '}
            <span className="font-semibold text-white">
              {Math.min(safeCurrentPage * ITEMS_PER_PAGE, invites.length)}
            </span>{' '}
            de <span className="font-semibold text-white">{invites.length}</span> convites
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">
              Página {safeCurrentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                data-testid="btn-prev-invites-page"
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                data-testid="btn-next-invites-page"
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
