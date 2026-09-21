import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserManagementView } from '../components/users/UserManagementView'
import * as api from '../services/api'
import type { User, UserInvite } from '../types/auth'

vi.mock('../services/api', () => ({
  fetchUsers: vi.fn(),
  deleteUser: vi.fn(),
  fetchInvites: vi.fn(),
  deleteInvite: vi.fn(),
  createInvite: vi.fn(),
  bulkDeleteUsers: vi.fn(),
  bulkDeleteInvites: vi.fn(),
  updateUser: vi.fn(),
  triggerUserPasswordReset: vi.fn(),
}))

const mockSuperAdmin: User = {
  id: 'user-super-1',
  email: 'admin@vturb.com',
  name: 'Super Admin Oficial',
  role: 'super_admin',
  is_super_admin: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockNormalAdmin: User = {
  id: 'user-admin-2',
  email: 'gerente@vturb.com',
  name: 'Gerente Admin',
  role: 'admin',
  is_super_admin: false,
  created_at: '2026-02-01T00:00:00Z',
}

const mockStandardUser: User = {
  id: 'user-std-3',
  email: 'cliente@vturb.com',
  name: 'Cliente Final',
  role: 'user',
  is_super_admin: false,
  created_at: '2026-03-01T00:00:00Z',
}

const mockInvitesList: UserInvite[] = [
  {
    id: 'inv-1',
    token: 'token-convite-1',
    role: 'admin',
    expires_at: '2026-12-31T23:59:59Z',
    is_used: false,
    created_at: '2026-09-11T10:00:00Z',
  },
  {
    id: 'inv-2',
    token: 'token-convite-2',
    role: 'user',
    expires_at: '2026-12-31T23:59:59Z',
    is_used: false,
    created_at: '2026-09-11T11:00:00Z',
  },
]

describe('UserManagementView - Gestão de Usuários e Convites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(api.fetchUsers).mockResolvedValue([mockSuperAdmin, mockNormalAdmin, mockStandardUser])
    vi.mocked(api.fetchInvites).mockResolvedValue(mockInvitesList)
    vi.mocked(api.deleteUser).mockResolvedValue({ detail: 'Usuário removido com sucesso.' })
    vi.mocked(api.deleteInvite).mockResolvedValue({ detail: 'Convite excluído com sucesso.' })
    vi.mocked(api.bulkDeleteUsers).mockResolvedValue({ deleted_count: 2, deleted_ids: ['user-admin-2', 'user-std-3'] })
    vi.mocked(api.bulkDeleteInvites).mockResolvedValue({ deleted_count: 2, deleted_ids: ['inv-1', 'inv-2'] })
  })

  it('bloqueia acesso quando usuário não for Super Admin', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockNormalAdmin} showToast={showToast} />)

    expect(screen.getByTestId('user-management-unauthorized')).toBeInTheDocument()
    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument()
  })

  it('renderiza corretamente a tela e lista de usuários para o Super Admin', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('user-management-view')).toBeInTheDocument()
      expect(screen.getByText('Gestão de Usuários')).toBeInTheDocument()
      expect(screen.getByText('admin@vturb.com')).toBeInTheDocument()
      expect(screen.getByText('gerente@vturb.com')).toBeInTheDocument()
      expect(screen.getByText('cliente@vturb.com')).toBeInTheDocument()
    })

    // Super Admin oficial está protegido contra exclusão
    expect(screen.getByTestId('protected-user-user-super-1')).toBeInTheDocument()
    expect(screen.queryByTestId('checkbox-user-user-super-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btn-delete-user-user-super-1')).not.toBeInTheDocument()
  })

  it('permite seleção múltipla e exclusão em lote de usuários', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-user-user-admin-2')).toBeInTheDocument()
    })

    // Seleciona todos os usuários selecionáveis
    fireEvent.click(screen.getByTestId('btn-select-all-users'))

    // Barra de ações em lote visível com 2 selecionados (super admin é excluído)
    expect(screen.getByTestId('bulk-actions-bar')).toBeInTheDocument()
    expect(screen.getByTestId('bulk-count-text')).toHaveTextContent('2 usuários selecionados')

    // Clica para excluir em lote
    fireEvent.click(screen.getByTestId('btn-bulk-delete-users'))

    // Confirma exclusão no modal
    expect(screen.getByText('Excluir Usuários Selecionados')).toBeInTheDocument()
    const confirmBtn = screen.getByText('Sim, Excluir')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(api.bulkDeleteUsers).toHaveBeenCalledWith(expect.arrayContaining(['user-admin-2', 'user-std-3']))
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('2 usuários excluídos com sucesso'))
    })
  })

  it('permite alternar para a aba Convites Gerados, selecionar em lote e excluir', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('tab-generated-invites')).toBeInTheDocument()
    })

    // Alterna para aba de convites
    fireEvent.click(screen.getByTestId('tab-generated-invites'))

    await waitFor(() => {
      expect(screen.getByTestId('invites-section')).toBeInTheDocument()
      expect(screen.getByTestId('checkbox-invite-inv-1')).toBeInTheDocument()
      expect(screen.getByTestId('checkbox-invite-inv-2')).toBeInTheDocument()
    })

    // Seleciona todos os convites
    fireEvent.click(screen.getByTestId('btn-select-all-invites'))

    expect(screen.getByTestId('bulk-actions-invites-bar')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('btn-bulk-delete-invites'))

    // Confirma exclusão
    expect(screen.getByText('Excluir Convites Selecionados')).toBeInTheDocument()
    const confirmBtn = screen.getByText('Sim, Excluir')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(api.bulkDeleteInvites).toHaveBeenCalledWith(expect.arrayContaining(['inv-1', 'inv-2']))
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('2 convites excluídos com sucesso'))
    })
  })

  it('seleciona globalmente todos os usuários mesmo que estejam em páginas diferentes', async () => {
    // Cria 25 usuários (20 na página 1, 5 na página 2)
    const manyUsers: User[] = [
      mockSuperAdmin,
      ...Array.from({ length: 25 }, (_, i) => ({
        id: `user-extra-${i + 1}`,
        email: `extra_${i + 1}@vturb.com`,
        name: `Usuário Extra ${i + 1}`,
        role: 'user',
        is_super_admin: false,
        created_at: '2026-03-01T00:00:00Z',
      })),
    ]
    vi.mocked(api.fetchUsers).mockResolvedValue(manyUsers)
    const showToast = vi.fn()

    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('btn-select-all-users')).toBeInTheDocument()
    })

    // Clica em Selecionar Todos
    fireEvent.click(screen.getByTestId('btn-select-all-users'))

    // Deve selecionar todos os 25 usuários comuns (o super admin não é selecionável)
    expect(screen.getByTestId('bulk-count-text')).toHaveTextContent('25 usuários selecionados')
    expect(screen.getByTestId('btn-select-all-users')).toHaveTextContent('Desmarcar Todos')

    // Avança para a página 2
    fireEvent.click(screen.getByTestId('pagination-users-next'))

    // O usuário da página 2 (ex: user-extra-21) deve estar renderizado
    expect(screen.getByTestId('checkbox-user-user-extra-21')).toBeInTheDocument()

    // Clica em Desmarcar Todos
    fireEvent.click(screen.getByTestId('btn-select-all-users'))
    expect(screen.queryByTestId('bulk-actions-bar')).not.toBeInTheDocument()
    expect(screen.getByTestId('btn-select-all-users')).toHaveTextContent('Selecionar Todos')
  })

  it('seleciona globalmente todos os convites mesmo que estejam em páginas diferentes', async () => {
    // Cria 25 convites (20 na página 1, 5 na página 2)
    const manyInvites: UserInvite[] = Array.from({ length: 25 }, (_, i) => ({
      id: `inv-extra-${i + 1}`,
      token: `token-extra-${i + 1}`,
      role: 'user',
      expires_at: '2026-12-31T23:59:59Z',
      is_used: false,
      created_at: '2026-09-11T10:00:00Z',
    }))
    vi.mocked(api.fetchInvites).mockResolvedValue(manyInvites)
    const showToast = vi.fn()

    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('tab-generated-invites')).toBeInTheDocument()
    })

    // Alterna para aba de convites
    fireEvent.click(screen.getByTestId('tab-generated-invites'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-select-all-invites')).toBeInTheDocument()
    })

    // Clica em Selecionar Todos
    fireEvent.click(screen.getByTestId('btn-select-all-invites'))

    // Deve selecionar todos os 25 convites
    expect(screen.getByTestId('bulk-actions-invites-bar')).toHaveTextContent('25 convites selecionados')
    expect(screen.getByTestId('btn-select-all-invites')).toHaveTextContent('Desmarcar Todos')

    // Avança para a página 2
    fireEvent.click(screen.getByTestId('pagination-invites-next'))

    // O convite da página 2 (ex: inv-extra-21) deve estar renderizado
    expect(screen.getByTestId('checkbox-invite-inv-extra-21')).toBeInTheDocument()

    // Clica em Desmarcar Todos
    fireEvent.click(screen.getByTestId('btn-select-all-invites'))
    expect(screen.queryByTestId('bulk-actions-invites-bar')).not.toBeInTheDocument()
    expect(screen.getByTestId('btn-select-all-invites')).toHaveTextContent('Selecionar Todos')
  })

  it('garante que o Super Admin fica sempre no topo da listagem de usuários mesmo vindo no fim da lista', async () => {
    // Lista onde o Super Admin vem intencionalmente na última posição
    const unorderedUsers = [mockStandardUser, mockNormalAdmin, mockSuperAdmin]
    vi.mocked(api.fetchUsers).mockResolvedValue(unorderedUsers)
    const showToast = vi.fn()

    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('users-section')).toBeInTheDocument()
    })

    const rows = screen.getAllByTestId(/^user-row-/)
    // O primeiro registro da tabela renderizada DEVE ser o Super Admin
    expect(rows[0]).toHaveAttribute('data-testid', `user-row-${mockSuperAdmin.id}`)
    expect(rows[0]).toHaveTextContent('admin@vturb.com')
    expect(rows[0]).toHaveTextContent('SUPER ADMIN')
  })

  it('permite filtrar usuários pelo dropdown de função (Super Admin, Admin, Usuário)', async () => {
    vi.mocked(api.fetchUsers).mockResolvedValue([mockSuperAdmin, mockNormalAdmin, mockStandardUser])
    const showToast = vi.fn()

    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('select-role-filter')).toBeInTheDocument()
    })

    const selectFilter = screen.getByTestId('select-role-filter')

    // 1. Filtra por Super Admin
    fireEvent.change(selectFilter, { target: { value: 'super_admin' } })
    expect(screen.getByTestId(`user-row-${mockSuperAdmin.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`user-row-${mockNormalAdmin.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`user-row-${mockStandardUser.id}`)).not.toBeInTheDocument()

    // 2. Filtra por Admin
    fireEvent.change(selectFilter, { target: { value: 'admin' } })
    expect(screen.queryByTestId(`user-row-${mockSuperAdmin.id}`)).not.toBeInTheDocument()
    expect(screen.getByTestId(`user-row-${mockNormalAdmin.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`user-row-${mockStandardUser.id}`)).not.toBeInTheDocument()

    // 3. Filtra por Usuário
    fireEvent.change(selectFilter, { target: { value: 'user' } })
    expect(screen.queryByTestId(`user-row-${mockSuperAdmin.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`user-row-${mockNormalAdmin.id}`)).not.toBeInTheDocument()
    expect(screen.getByTestId(`user-row-${mockStandardUser.id}`)).toBeInTheDocument()

    // 4. Volta para Todas as Funções (all)
    fireEvent.change(selectFilter, { target: { value: 'all' } })
    expect(screen.getByTestId(`user-row-${mockSuperAdmin.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`user-row-${mockNormalAdmin.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`user-row-${mockStandardUser.id}`)).toBeInTheDocument()
  })

  it('exibe botão de editar para admin e usuário, oculta no super admin e permite salvar alterações pelo modal', async () => {
    vi.mocked(api.fetchUsers).mockResolvedValue([mockSuperAdmin, mockNormalAdmin, mockStandardUser])
    const updatedUser: User = {
      ...mockNormalAdmin,
      name: 'Gerente Geral Editado',
      email: 'gerente.editado@vturb.com',
      role: 'user',
    }
    vi.mocked(api.updateUser).mockResolvedValue(updatedUser)
    const showToast = vi.fn()

    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId(`user-row-${mockNormalAdmin.id}`)).toBeInTheDocument()
    })

    // Super Admin NÃO deve ter botão de editar
    expect(screen.queryByTestId(`btn-edit-user-${mockSuperAdmin.id}`)).not.toBeInTheDocument()

    // Admin e Usuário comum DEVEM ter botão de editar
    expect(screen.getByTestId(`btn-edit-user-${mockNormalAdmin.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`btn-edit-user-${mockStandardUser.id}`)).toBeInTheDocument()

    // Clica no botão de editar do Admin
    fireEvent.click(screen.getByTestId(`btn-edit-user-${mockNormalAdmin.id}`))

    // Modal de edição deve estar visível e NÃO conter o campo de nova senha
    expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument()
    expect(screen.getByTestId('input-edit-user-name')).toHaveValue('Gerente Admin')
    expect(screen.getByTestId('input-edit-user-email')).toHaveValue('gerente@vturb.com')
    expect(screen.queryByTestId('input-edit-user-password')).not.toBeInTheDocument()
    expect(screen.getByTestId('btn-modal-reset-password')).toBeInTheDocument()

    // Altera os campos no modal
    fireEvent.change(screen.getByTestId('input-edit-user-name'), { target: { value: 'Gerente Geral Editado' } })
    fireEvent.change(screen.getByTestId('input-edit-user-email'), { target: { value: 'gerente.editado@vturb.com' } })
    fireEvent.change(screen.getByTestId('select-edit-user-role'), { target: { value: 'user' } })

    // Salva o formulário
    fireEvent.click(screen.getByTestId('btn-save-edit-user'))

    await waitFor(() => {
      expect(api.updateUser).toHaveBeenCalledWith(mockNormalAdmin.id, {
        name: 'Gerente Geral Editado',
        email: 'gerente.editado@vturb.com',
        role: 'user',
      })
      expect(showToast).toHaveBeenCalledWith('Usuário atualizado com sucesso!')
    })

    // O modal deve ser fechado após salvar
    expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument()
  })

  it('exibe botão de redefinir senha ao lado do botão de editar e permite disparar a redefinição de senha', async () => {
    vi.mocked(api.fetchUsers).mockResolvedValue([mockSuperAdmin, mockNormalAdmin, mockStandardUser])
    vi.mocked(api.triggerUserPasswordReset).mockResolvedValue({
      success: true,
      message: 'Instruções de redefinição de senha geradas com sucesso para gerente@vturb.com.',
      token: 'mock-reset-token-123',
      reset_url: '/reset-password?token=mock-reset-token-123',
    })
    const showToast = vi.fn()

    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId(`user-row-${mockNormalAdmin.id}`)).toBeInTheDocument()
    })

    // Super Admin NÃO deve ter botão de redefinir senha
    expect(screen.queryByTestId(`btn-reset-password-${mockSuperAdmin.id}`)).not.toBeInTheDocument()

    // Admin e Usuário comum DEVEM ter botão de redefinir senha
    const btnResetAdmin = screen.getByTestId(`btn-reset-password-${mockNormalAdmin.id}`)
    expect(btnResetAdmin).toBeInTheDocument()
    expect(screen.getByTestId(`btn-reset-password-${mockStandardUser.id}`)).toBeInTheDocument()

    // Clica no botão de redefinir senha
    fireEvent.click(btnResetAdmin)

    // Modal de confirmação deve abrir
    expect(screen.getByTestId('reset-password-modal-content')).toBeInTheDocument()
    expect(screen.getByText(/Deseja redefinir a senha do usuário/i)).toBeInTheDocument()

    // Confirma a redefinição
    fireEvent.click(screen.getByTestId('btn-confirm-reset-password'))

    await waitFor(() => {
      expect(api.triggerUserPasswordReset).toHaveBeenCalledWith(mockNormalAdmin.id)
      expect(screen.getByTestId('input-generated-reset-url')).toBeInTheDocument()
      expect(screen.getByTestId('input-generated-reset-url')).toHaveValue(
        `${window.location.origin}/reset-password?token=mock-reset-token-123`
      )
    })

    // Fecha o modal de sucesso
    fireEvent.click(screen.getByTestId('btn-close-reset-password-success'))
    expect(screen.queryByTestId('reset-password-modal-content')).not.toBeInTheDocument()
  })
})
