import React, { useState, useMemo } from 'react'
import {
  Trash2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react'
import type { User } from '../../types/auth'

const ITEMS_PER_PAGE = 20

interface UsersTableProps {
  users: User[]
  currentUser: User | null
  onDeleteUser: (user: User) => void
  onBulkDeleteUsers: (userIds: string[]) => void
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUser,
  onDeleteUser,
  onBulkDeleteUsers,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const isSelectable = (user: User) => {
    if (user.is_super_admin || user.role === 'super_admin') return false
    if (currentUser && user.id === currentUser.id) return false
    return true
  }

  const totalPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    return users.slice(start, start + ITEMS_PER_PAGE)
  }, [users, safeCurrentPage])

  const selectableOnCurrentPage = useMemo(() => {
    return paginatedUsers.filter(isSelectable)
  }, [paginatedUsers])

  const allCurrentSelected =
    selectableOnCurrentPage.length > 0 &&
    selectableOnCurrentPage.every((u) => selectedIds.includes(u.id))

  const someCurrentSelected =
    selectableOnCurrentPage.some((u) => selectedIds.includes(u.id)) && !allCurrentSelected

  const handleToggleSelectAll = () => {
    if (allCurrentSelected) {
      const currentIds = new Set(selectableOnCurrentPage.map((u) => u.id))
      setSelectedIds((prev) => prev.filter((id) => !currentIds.has(id)))
    } else {
      const toAdd = selectableOnCurrentPage.map((u) => u.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...toAdd])))
    }
  }

  const handleToggleSelectUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return
    onBulkDeleteUsers(selectedIds)
  }

  return (
    <div className="space-y-4" data-testid="users-section">
      {/* Barra de Ações em Lote */}
      {selectedIds.length > 0 && (
        <div
          data-testid="bulk-actions-bar"
          className="flex items-center justify-between px-4 py-3 bg-red-950/40 border border-red-500/40 rounded-xl backdrop-blur-md animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm font-medium text-red-200" data-testid="bulk-count-text">
              {selectedIds.length} {selectedIds.length === 1 ? 'usuário selecionado' : 'usuários selecionados'}
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
              data-testid="btn-bulk-delete-users"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg shadow-lg shadow-red-900/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir selecionados ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm">
        <table className="w-full text-left border-collapse text-sm" data-testid="users-table">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <th className="w-12 px-4 py-3.5 text-center">
                <button
                  onClick={handleToggleSelectAll}
                  data-testid="btn-select-all-users"
                  disabled={selectableOnCurrentPage.length === 0}
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
              <th className="px-4 py-3.5">Usuário</th>
              <th className="px-4 py-3.5">Função</th>
              <th className="px-4 py-3.5">Data de Criação</th>
              <th className="px-4 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
                const selectable = isSelectable(user)
                const isSelected = selectedIds.includes(user.id)
                const isSuperAdmin = user.is_super_admin || user.role === 'super_admin'
                const isCurrent = currentUser?.id === user.id

                return (
                  <tr
                    key={user.id}
                    data-testid={`user-row-${user.id}`}
                    className={`transition-colors ${
                      isSelected ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      {selectable ? (
                        <button
                          onClick={() => handleToggleSelectUser(user.id)}
                          data-testid={`checkbox-user-${user.id}`}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <span title="Protegido contra seleção e exclusão" data-testid={`protected-user-${user.id}`}>
                          <Lock className="w-3.5 h-3.5 mx-auto text-zinc-600" />
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner ${
                            isSuperAdmin
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                              : user.role === 'admin'
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {user.email.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{user.email}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                                Você
                              </span>
                            )}
                          </div>
                          {user.name && <span className="text-xs text-zinc-400">{user.name}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {isSuperAdmin ? (
                        <span
                          data-testid={`badge-role-${user.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-full"
                        >
                          <ShieldAlert className="w-3 h-3 text-purple-400" />
                          SUPER ADMIN
                        </span>
                      ) : user.role === 'admin' ? (
                        <span
                          data-testid={`badge-role-${user.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-full"
                        >
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          ADMIN
                        </span>
                      ) : (
                        <span
                          data-testid={`badge-role-${user.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full"
                        >
                          <UserIcon className="w-3 h-3 text-zinc-400" />
                          USUÁRIO
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-zinc-400 text-xs">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {selectable ? (
                        <button
                          onClick={() => onDeleteUser(user)}
                          data-testid={`btn-delete-user-${user.id}`}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-500 cursor-not-allowed"
                          title="O Super Admin oficial e a própria conta não podem ser excluídos"
                        >
                          <Lock className="w-3 h-3" />
                          Protegido
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé com Paginação de 20 itens */}
      {users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-zinc-400" data-testid="users-pagination">
          <div>
            Mostrando{' '}
            <span className="font-semibold text-white">
              {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            a{' '}
            <span className="font-semibold text-white">
              {Math.min(safeCurrentPage * ITEMS_PER_PAGE, users.length)}
            </span>{' '}
            de <span className="font-semibold text-white">{users.length}</span> usuários
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">
              Página {safeCurrentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                data-testid="btn-prev-users-page"
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                data-testid="btn-next-users-page"
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
