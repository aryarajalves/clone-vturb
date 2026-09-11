import React, { useState, useMemo } from 'react'
import {
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Shield,
  ShieldAlert,
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

  const getRoleBadge = (user: User) => {
    if (user.is_super_admin || user.role === 'super_admin') {
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

  return (
    <div data-testid="users-section">
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
            {allCurrentSelected ? (
              <CheckSquare size={16} color="#0284c7" />
            ) : (
              <Square size={16} color="#64748b" />
            )}
            <span>{allCurrentSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
          </button>

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

        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          {users.length} {users.length === 1 ? 'usuário registrado' : 'usuários registrados'}
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
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isChecked = selectedIds.includes(user.id)
                  const selectable = isSelectable(user)
                  const isSuper = user.is_super_admin || user.role === 'super_admin'
                  const badge = getRoleBadge(user)
                  const initial = (user.name?.charAt(0) || user.email.charAt(0) || 'U').toUpperCase()

                  return (
                    <tr
                      key={user.id}
                      data-testid={`user-row-${user.id}`}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isChecked ? '#f0f9ff' : 'transparent',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        {selectable ? (
                          <button
                            type="button"
                            data-testid={`checkbox-user-${user.id}`}
                            onClick={() => handleToggleSelectUser(user.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {isChecked ? <CheckSquare size={18} color="#0284c7" /> : <Square size={18} color="#94a3b8" />}
                          </button>
                        ) : (
                          <span data-testid={`protected-user-${user.id}`}>
                            <Lock size={16} color="#94a3b8" title="Conta protegida" />
                          </span>
                        )}
                      </td>

                      {/* Coluna do Usuário */}
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

                      {/* Coluna Função */}
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

                      {/* Coluna Data */}
                      <td style={{ padding: '0.9rem 1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
                        {formatDate(user.created_at)}
                      </td>

                      {/* Coluna Ações */}
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        {selectable ? (
                          <button
                            type="button"
                            data-testid={`btn-delete-user-${user.id}`}
                            onClick={() => onDeleteUser(user)}
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
                            <Trash2 size={16} />
                          </button>
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
    </div>
  )
}
