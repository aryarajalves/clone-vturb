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
})
