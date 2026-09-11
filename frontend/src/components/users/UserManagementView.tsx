import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  UserPlus,
  Trash2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  Copy,
  Clock,
  Check,
} from 'lucide-react'
import type { User, UserInvite } from '../../types/auth'
import { fetchUsers, deleteUser, fetchInvites, deleteInvite } from '../../services/api'
import { CreateInviteModal } from './CreateInviteModal'
import { DeleteConfirmModal } from '../DeleteConfirmModal'

interface UserManagementViewProps {
  currentUser: User | null
  showToast: (msg: string) => void
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<UserInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // Exclusão de usuário
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Exclusão de convite
  const [inviteToDelete, setInviteToDelete] = useState<UserInvite | null>(null)
  const [deleteInviteLoading, setDeleteInviteLoading] = useState(false)

  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [usersData, invitesData] = await Promise.all([
        fetchUsers(),
        fetchInvites().catch(() => [] as UserInvite[]),
      ])
      setUsers(usersData)
      setInvites(invitesData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados de usuários.'
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    try {
      setDeleteLoading(true)
      await deleteUser(userToDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      showToast(`Usuário ${userToDelete.email} removido com sucesso.`)
      setUserToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir usuário.'
      showToast(msg)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteInviteConfirm = async () => {
    if (!inviteToDelete) return
    try {
      setDeleteInviteLoading(true)
      await deleteInvite(inviteToDelete.id)
      setInvites((prev) => prev.filter((i) => i.id !== inviteToDelete.id))
      showToast('Convite excluído com sucesso.')
      setInviteToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir convite.'
      showToast(msg)
    } finally {
      setDeleteInviteLoading(false)
    }
  }

  const handleCopyInviteUrl = async (e: React.MouseEvent, token: string) => {
    e.preventDefault()
    e.stopPropagation()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/invite/${token}`
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedToken(token)
      showToast('Link do convite copiado!')
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      showToast('Erro ao copiar link.')
    }
  }

  const renderRoleBadge = (user: User) => {
    const isSuper = user.is_super_admin || user.role === 'super_admin'
    const isAdmin = !isSuper && user.role === 'admin'

    if (isSuper) {
      return (
        <span
          data-testid="badge-super-admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#f5f3ff',
            color: '#7c3aed',
            border: '1px solid #ddd6fe',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <ShieldAlert size={13} />
          SuperAdmin
        </span>
      )
    }

    if (isAdmin) {
      return (
        <span
          data-testid="badge-admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <ShieldCheck size={13} />
          Admin
        </span>
      )
    }

    return (
      <span
        data-testid="badge-user"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#f8fafc',
          color: '#475569',
          border: '1px solid #e2e8f0',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        <UserIcon size={13} />
        Usuário
      </span>
    )
  }

  return (
    <main
      data-testid="user-management-view"
      style={{
        flex: 1,
        padding: '2rem 3rem',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Cabeçalho da Página */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            data-testid="users-page-title"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1e293b',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Users size={26} color="#0284c7" />
            Gestão de Usuários
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Gerencie o acesso à plataforma e convide novos administradores e usuários.
          </p>
        </div>

        <button
          type="button"
          data-testid="btn-open-create-invite"
          onClick={() => setIsInviteModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.15)',
            transition: 'background 0.2s',
          }}
        >
          <UserPlus size={18} />
          <span>Criar Usuário</span>
        </button>
      </div>

      {/* Navegação por Abas: Usuários Ativos vs Convites Gerados */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          data-testid="tab-active-users"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'users' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'users' ? '#0284c7' : '#64748b',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={18} />
          <span>Usuários Ativos</span>
          <span
            style={{
              backgroundColor: activeTab === 'users' ? '#e0f2fe' : '#f1f5f9',
              color: activeTab === 'users' ? '#0284c7' : '#64748b',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          data-testid="tab-generated-invites"
          onClick={() => setActiveTab('invites')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'invites' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'invites' ? '#0284c7' : '#64748b',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            transition: 'all 0.15s ease',
          }}
        >
          <Clock size={18} />
          <span>Convites Gerados</span>
          <span
            style={{
              backgroundColor: activeTab === 'invites' ? '#e0f2fe' : '#f1f5f9',
              color: activeTab === 'invites' ? '#0284c7' : '#64748b',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {invites.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div
          data-testid="users-loading-indicator"
          style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}
        >
          Carregando dados...
        </div>
      ) : activeTab === 'users' ? (
        /* Aba 1: Tabela de Usuários Ativos */
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.15rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
              Usuários Cadastrados ({users.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              O SuperAdmin oficial possui proteção de sistema e não pode ser deletado.
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              data-testid="users-table"
              style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    USUÁRIO / E-MAIL
                  </th>
                  <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    TIPO DE USUÁRIO
                  </th>
                  <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    DATA DE CADASTRO
                  </th>
                  <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSuper = u.is_super_admin || u.role === 'super_admin'
                  const isCurrent = currentUser?.id === u.id

                  return (
                    <tr
                      key={u.id}
                      data-testid={`user-row-${u.id}`}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                          {u.email}
                        </div>
                        {isCurrent && (
                          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 500 }}>
                            (Você)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>{renderRoleBadge(u)}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        {isSuper ? (
                          <span
                            data-testid={`super-admin-protected-${u.id}`}
                            title="O Super Admin não pode ser excluído"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: '#94a3b8',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              backgroundColor: '#f1f5f9',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '8px',
                            }}
                          >
                            <Lock size={13} />
                            Imutável
                          </span>
                        ) : (
                          <button
                            type="button"
                            data-testid={`btn-delete-user-${u.id}`}
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: isCurrent ? '#cbd5e1' : '#ef4444',
                              cursor: isCurrent ? 'not-allowed' : 'pointer',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s',
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Aba 2: Tabela de Convites Gerados */
        <div
          data-testid="invites-section"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.15rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
              Histórico de Convites ({invites.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Convites expirados ou utilizados podem ser removidos da listagem.
            </span>
          </div>

          {invites.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              Nenhum convite gerado até o momento. Clique em <strong>"Criar Usuário"</strong> para gerar um link.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                      TIPO DE CONVITE
                    </th>
                    <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                      STATUS
                    </th>
                    <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                      EXPIRAÇÃO
                    </th>
                    <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => {
                    const isExpired = new Date(inv.expires_at).getTime() < Date.now()

                    return (
                      <tr key={inv.id} data-testid={`invite-row-${inv.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600, textTransform: 'capitalize', color: '#1e293b' }}>
                          {inv.role === 'admin' ? 'Admin' : 'Usuário'}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {inv.is_used ? (
                            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>
                              ✓ Utilizado {inv.used_by_email ? `(${inv.used_by_email})` : ''}
                            </span>
                          ) : isExpired ? (
                            <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>
                              ✕ Expirado
                            </span>
                          ) : (
                            <span style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.8rem' }}>
                              ● Ativo
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                          {new Date(inv.expires_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            {!inv.is_used && !isExpired && (
                              <button
                                type="button"
                                data-testid={`btn-copy-table-invite-${inv.id}`}
                                onClick={(e) => handleCopyInviteUrl(e, inv.token)}
                                style={{
                                  backgroundColor: copiedToken === inv.token ? '#10b981' : '#f1f5f9',
                                  color: copiedToken === inv.token ? '#fff' : '#0284c7',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                {copiedToken === inv.token ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedToken === inv.token ? 'Copiado' : 'Copiar Link'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              data-testid={`btn-delete-invite-${inv.id}`}
                              onClick={() => setInviteToDelete(inv)}
                              title="Excluir convite"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '0.35rem',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação de Convite */}
      <CreateInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteCreated={(newInvite) => {
          setInvites((prev) => [newInvite, ...prev])
          setActiveTab('invites')
        }}
        showToast={showToast}
      />

      {/* Modal de Confirmação de Exclusão de Usuário */}
      <DeleteConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Excluir Usuário"
        itemName={userToDelete?.email || ''}
        description={`Tem certeza de que deseja excluir o usuário "${userToDelete?.email}"? O acesso dele à plataforma será revogado.`}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Modal de Confirmação de Exclusão de Convite */}
      <DeleteConfirmModal
        isOpen={Boolean(inviteToDelete)}
        title="Excluir Convite"
        itemName={inviteToDelete ? `Convite para ${inviteToDelete.role === 'admin' ? 'Admin' : 'Usuário'}` : ''}
        description={`Tem certeza de que deseja excluir este convite de ${inviteToDelete?.role === 'admin' ? 'Administrador' : 'Usuário'}? O link deixará de funcionar imediatamente.`}
        loading={deleteInviteLoading}
        onConfirm={handleDeleteInviteConfirm}
        onCancel={() => setInviteToDelete(null)}
      />
    </main>
  )
}
