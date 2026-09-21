import React, { useState, useMemo, useEffect } from 'react'
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react'
import type { User } from '../../types/auth'
import { UserTableRow } from './UserTableRow'
import { EditUserModal } from './EditUserModal'

const ITEMS_PER_PAGE = 20

interface UsersTableProps {
  users: User[]
  currentUser: User | null
  onDeleteUser: (user: User) => void
  onBulkDeleteUsers: (userIds: string[]) => void
  onUserUpdated?: (user: User) => void
  onResetPasswordUser?: (user: User) => void
  showToast?: (msg: string) => void
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUser,
  onDeleteUser,
  onBulkDeleteUsers,
  onUserUpdated,
  onResetPasswordUser,
  showToast,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'user'>('all')
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  const isSelectable = (user: User) => {
    if (user.is_super_admin || user.role === 'super_admin') return false
    if (currentUser && user.id === currentUser.id) return false
    return true
  }

  // 1. Super Admin SEMPRE no topo absoluto da lista
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const isASuper = a.is_super_admin || a.role === 'super_admin'
      const isBSuper = b.is_super_admin || b.role === 'super_admin'
      if (isASuper && !isBSuper) return -1
      if (!isASuper && isBSuper) return 1
      return 0
    })
  }, [users])

  // 2. Filtro por tipo/função de usuário (Super Admin, Admin, Usuário)
  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return sortedUsers
    if (roleFilter === 'super_admin') {
      return sortedUsers.filter((u) => u.is_super_admin || u.role === 'super_admin')
    }
    return sortedUsers.filter((u) => u.role === roleFilter && !u.is_super_admin)
  }, [sortedUsers, roleFilter])

  // Paginação sobre os usuários filtrados
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, safeCurrentPage])

  // Usuários selecionáveis respeitando o filtro atual
  const selectableUsers = useMemo(() => {
    return filteredUsers.filter(isSelectable)
  }, [filteredUsers, currentUser])

  const allSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((u) => selectedIds.includes(u.id))

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(selectableUsers.map((u) => u.id))
    }
  }

  const handleToggleSelectUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  // Sincroniza seleção quando a lista de usuários é modificada
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => users.some((u) => u.id === id)))
  }, [users])

  const handleUserUpdatedSuccess = (updated: User) => {
    if (onUserUpdated) {
      onUserUpdated(updated)
    }
    setUserToEdit(null)
  }

  return (
    <div data-testid="users-section">
      {/* Barra de Ações em Lote, Filtros e Contagem */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Botão Selecionar Todos / Desmarcar Todos */}
          <button
            type="button"
            data-testid="btn-select-all-users"
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
            {allSelected ? (
              <CheckSquare size={16} color="#0284c7" />
            ) : (
              <Square size={16} color="#64748b" />
            )}
            <span>{allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
          </button>

          {/* Ações em Lote quando há seleção */}
          {selectedIds.length > 0 && (
            <div
              data-testid="bulk-actions-bar"
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
                data-testid="bulk-count-text"
                style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}
              >
                {selectedIds.length} {selectedIds.length === 1 ? 'usuário selecionado' : 'usuários selecionados'}
              </span>
              <button
                type="button"
                data-testid="btn-bulk-delete-users"
                onClick={() => onBulkDeleteUsers(selectedIds)}
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

        {/* Lado Direito: Dropdown de Filtro por Função + Contador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="#64748b" />
            <select
              data-testid="select-role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas as Funções</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrador (Admin)</option>
              <option value="user">Usuário</option>
            </select>
          </div>

          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário registrado' : 'usuários registrados'}
          </span>
        </div>
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
                  Usuário
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Função
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Data de Criação
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Nenhum usuário encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    currentUser={currentUser}
                    isSelected={selectedIds.includes(user.id)}
                    isSelectable={isSelectable(user)}
                    onToggleSelect={handleToggleSelectUser}
                    onEdit={(u) => setUserToEdit(u)}
                    onResetPassword={(u) => onResetPasswordUser && onResetPasswordUser(u)}
                    onDelete={onDeleteUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div
            data-testid="users-pagination"
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
                data-testid="pagination-users-prev"
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
                data-testid="pagination-users-next"
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

      {/* Modal de Edição de Usuário */}
      <EditUserModal
        isOpen={!!userToEdit}
        user={userToEdit}
        onClose={() => setUserToEdit(null)}
        onUserUpdated={handleUserUpdatedSuccess}
        onOpenResetPassword={onResetPasswordUser}
        showToast={showToast || (() => {})}
      />
    </div>
  )
}
