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

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users')
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center" data-testid="user-management-unauthorized">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
        <p className="text-zinc-400 max-w-md">
          Apenas o Super Administrador tem permissão para visualizar e gerenciar as contas de usuários.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="user-management-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            Gestão de Usuários
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie os usuários ativos e controle os convites de acesso à plataforma.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          data-testid="btn-open-create-invite"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Criar Convite
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px">
        <button
          onClick={() => setActiveTab('users')}
          data-testid="tab-active-users"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors relative ${
            activeTab === 'users'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários Ativos
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'users'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/5 text-zinc-400'
            }`}
          >
            {users.length}
          </span>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('invites')}
          data-testid="tab-generated-invites"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors relative ${
            activeTab === 'invites'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Convites Gerados
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'invites'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/5 text-zinc-400'
            }`}
          >
            {invites.length}
          </span>
          {activeTab === 'invites' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Carregando dados...</span>
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
          setActiveTab('invites')
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
    </div>
  )
}
