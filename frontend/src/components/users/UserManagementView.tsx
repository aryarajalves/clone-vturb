import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  UserPlus,
  Lock,
} from 'lucide-react'
import type { User, UserInvite } from '../../types/auth'
import {
  fetchUsers,
  deleteUser,
  fetchInvites,
  deleteInvite,
  bulkDeleteUsers,
  bulkDeleteInvites,
} from '../../services/api'
import { CreateInviteModal } from './CreateInviteModal'
import { UsersTable } from './UsersTable'
import { InvitesTable } from './InvitesTable'
import { DeleteConfirmModal } from '../DeleteConfirmModal'

interface UserManagementViewProps {
  currentUser: User | null
  showToast: (msg: string) => void
}

const USER_TAB_KEY = 'vturb_user_active_subtab'

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>(() => {
    const saved = localStorage.getItem(USER_TAB_KEY)
    if (saved === 'users' || saved === 'invites') return saved
    return 'users'
  })
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<UserInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // Exclusão individual
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [inviteToDelete, setInviteToDelete] = useState<UserInvite | null>(null)
  const [deleteInviteLoading, setDeleteInviteLoading] = useState(false)

  // Exclusão em lote
  const [bulkUsersToDelete, setBulkUsersToDelete] = useState<string[]>([])
  const [bulkDeleteUsersLoading, setBulkDeleteUsersLoading] = useState(false)
  const [bulkInvitesToDelete, setBulkInvitesToDelete] = useState<string[]>([])
  const [bulkDeleteInvitesLoading, setBulkDeleteInvitesLoading] = useState(false)

  const handleSelectTab = (tab: 'users' | 'invites') => {
    setActiveTab(tab)
    localStorage.setItem(USER_TAB_KEY, tab)
  }

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

  // Exclusão individual de usuário
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

  // Exclusão individual de convite
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

  // Exclusão em lote de usuários
  const handleBulkDeleteUsersConfirm = async () => {
    if (bulkUsersToDelete.length === 0) return
    try {
      setBulkDeleteUsersLoading(true)
      const res = await bulkDeleteUsers(bulkUsersToDelete)
      setUsers((prev) => prev.filter((u) => !res.deleted_ids.includes(u.id)))
      showToast(`${res.deleted_count} ${res.deleted_count === 1 ? 'usuário excluído' : 'usuários excluídos'} com sucesso.`)
      setBulkUsersToDelete([])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir usuários em lote.'
      showToast(msg)
    } finally {
      setBulkDeleteUsersLoading(false)
    }
  }

  // Exclusão em lote de convites
  const handleBulkDeleteInvitesConfirm = async () => {
    if (bulkInvitesToDelete.length === 0) return
    try {
      setBulkDeleteInvitesLoading(true)
      const res = await bulkDeleteInvites(bulkInvitesToDelete)
      setInvites((prev) => prev.filter((i) => !res.deleted_ids.includes(i.id)))
      showToast(`${res.deleted_count} ${res.deleted_count === 1 ? 'convite excluído' : 'convites excluídos'} com sucesso.`)
      setBulkInvitesToDelete([])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir convites em lote.'
      showToast(msg)
    } finally {
      setBulkDeleteInvitesLoading(false)
    }
  }

  // Se não for Super Admin, bloqueia acesso
  if (currentUser && !currentUser.is_super_admin && currentUser.role !== 'super_admin') {
    return (
      <div
        data-testid="user-management-unauthorized"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#ef4444',
          }}
        >
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
          Acesso Restrito
        </h2>
        <p style={{ color: '#64748b', maxWidth: '420px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Apenas o Super Administrador tem permissão para visualizar e gerenciar as contas de usuários.
        </p>
      </div>
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
      {/* Cabeçalho da Gestão de Usuários */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Users size={28} color="#0284c7" />
            <span>Gestão de Usuários</span>
          </h2>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Gerencie os usuários ativos e controle os convites de acesso à plataforma.
          </span>
        </div>

        <button
          type="button"
          data-testid="btn-open-create-invite"
          onClick={() => setIsInviteModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.35rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s',
          }}
        >
          <UserPlus size={18} />
          <span>Criar Convite</span>
        </button>
      </div>

      {/* Navegação por Abas (Design System VTurb) */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.75rem',
        }}
      >
        <button
          type="button"
          data-testid="tab-active-users"
          onClick={() => handleSelectTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #0284c7' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'users' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'users' ? 600 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Users size={18} />
          <span>Usuários Ativos</span>
          <span
            style={{
              padding: '0.15rem 0.55rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '20px',
              backgroundColor: activeTab === 'users' ? '#e0f2fe' : '#f1f5f9',
              color: activeTab === 'users' ? '#0284c7' : '#64748b',
            }}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          data-testid="tab-generated-invites"
          onClick={() => handleSelectTab('invites')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'invites' ? '2px solid #0284c7' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'invites' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'invites' ? 600 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <UserPlus size={18} />
          <span>Convites Gerados</span>
          <span
            style={{
              padding: '0.15rem 0.55rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '20px',
              backgroundColor: activeTab === 'invites' ? '#e0f2fe' : '#f1f5f9',
              color: activeTab === 'invites' ? '#0284c7' : '#64748b',
            }}
          >
            {invites.length}
          </span>
        </button>
      </div>

      {/* Conteúdo da Aba */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <div>Carregando dados de usuários...</div>
        </div>
      ) : activeTab === 'users' ? (
        <UsersTable
          users={users}
          currentUser={currentUser}
          onDeleteUser={(u) => setUserToDelete(u)}
          onBulkDeleteUsers={(ids) => setBulkUsersToDelete(ids)}
        />
      ) : (
        <InvitesTable
          invites={invites}
          onDeleteInvite={(i) => setInviteToDelete(i)}
          onBulkDeleteInvites={(ids) => setBulkInvitesToDelete(ids)}
          showToast={showToast}
        />
      )}

      {/* Modal de Criação de Convite */}
      <CreateInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteCreated={(newInvite) => {
          setInvites((prev) => [newInvite, ...prev])
          handleSelectTab('invites')
        }}
        showToast={showToast}
      />

      {/* Modal de Exclusão Individual de Usuário */}
      <DeleteConfirmModal
        isOpen={!!userToDelete}
        title="Excluir Usuário"
        itemName={userToDelete?.email || ''}
        description={`Tem certeza que deseja excluir o usuário ${userToDelete?.email}? Esta ação removerá o acesso dele e não poderá ser desfeita.`}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Modal de Exclusão Individual de Convite */}
      <DeleteConfirmModal
        isOpen={!!inviteToDelete}
        title="Excluir Convite"
        description="Tem certeza que deseja excluir este link de convite? Ele deixará de funcionar imediatamente."
        loading={deleteInviteLoading}
        onConfirm={handleDeleteInviteConfirm}
        onCancel={() => setInviteToDelete(null)}
      />

      {/* Modal de Exclusão em Lote de Usuários */}
      <DeleteConfirmModal
        isOpen={bulkUsersToDelete.length > 0}
        title="Excluir Usuários Selecionados"
        itemCount={bulkUsersToDelete.length}
        description={`Tem certeza que deseja excluir os ${bulkUsersToDelete.length} usuários selecionados? Esta ação é irreversível e revogará o acesso de todas essas contas.`}
        loading={bulkDeleteUsersLoading}
        onConfirm={handleBulkDeleteUsersConfirm}
        onCancel={() => setBulkUsersToDelete([])}
      />

      {/* Modal de Exclusão em Lote de Convites */}
      <DeleteConfirmModal
        isOpen={bulkInvitesToDelete.length > 0}
        title="Excluir Convites Selecionados"
        itemCount={bulkInvitesToDelete.length}
        description={`Tem certeza que deseja excluir os ${bulkInvitesToDelete.length} convites selecionados? Todos os links selecionados perderão a validade.`}
        loading={bulkDeleteInvitesLoading}
        onConfirm={handleBulkDeleteInvitesConfirm}
        onCancel={() => setBulkInvitesToDelete([])}
      />
    </main>
  )
}
