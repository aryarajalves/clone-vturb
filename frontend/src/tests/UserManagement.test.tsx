import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserManagementView } from '../components/users/UserManagementView'
import { CreateInviteModal } from '../components/users/CreateInviteModal'
import { Sidebar } from '../components/Sidebar'
import type { User, UserInvite } from '../types/auth'
import * as api from '../services/api'

vi.mock('../services/api', () => ({
  fetchUsers: vi.fn(),
  fetchInvites: vi.fn(),
  deleteUser: vi.fn(),
  createInvite: vi.fn(),
  deleteInvite: vi.fn(),
}))

describe('Gestão de Usuários - Frontend', () => {
  const mockSuperAdmin: User = {
    id: 'user-super-admin-1',
    email: 'superadmin@vturb.com',
    role: 'super_admin',
    is_super_admin: true,
    created_at: '2026-09-10T12:00:00Z',
  }

  const mockAdmin: User = {
    id: 'user-admin-2',
    email: 'admin@vturb.com',
    role: 'admin',
    is_super_admin: false,
    created_at: '2026-09-11T10:00:00Z',
  }

  const mockUser: User = {
    id: 'user-common-3',
    email: 'usuario@vturb.com',
    role: 'user',
    is_super_admin: false,
    created_at: '2026-09-11T11:00:00Z',
  }

  const mockInvites: UserInvite[] = [
    {
      id: 'inv-1',
      token: 'token-abc-123',
      role: 'admin',
      expires_at: '2026-09-12T12:00:00Z',
      is_used: false,
      created_at: '2026-09-11T12:00:00Z',
      invite_url: '/invite/token-abc-123',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.fetchUsers).mockResolvedValue([mockSuperAdmin, mockAdmin, mockUser])
    vi.mocked(api.fetchInvites).mockResolvedValue(mockInvites)
    vi.mocked(api.deleteUser).mockResolvedValue({ detail: 'Usuário excluído.' })
    vi.mocked(api.deleteInvite).mockResolvedValue({ detail: 'Convite excluído.' })
  })

  it('Sidebar renderiza botão Gestão de Usuário e aciona onSelectTab', () => {
    const onSelectTab = vi.fn()
    render(<Sidebar currentTab="videos" onSelectTab={onSelectTab} />)

    const userBtn = screen.getByTestId('nav-gestao-usuarios')
    expect(userBtn).toBeInTheDocument()
    expect(userBtn).toHaveTextContent('Gestão de Usuário')

    fireEvent.click(userBtn)
    expect(onSelectTab).toHaveBeenCalledWith('users')
  })

  it('renderiza a lista de usuários contendo o SuperAdmin e exibe proteção imutável', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByText('superadmin@vturb.com')).toBeInTheDocument()
      expect(screen.getByText('admin@vturb.com')).toBeInTheDocument()
      expect(screen.getByText('usuario@vturb.com')).toBeInTheDocument()
    })

    // SuperAdmin possui badge de SuperAdmin e indicador de proteção imutável sem botão de deletar
    expect(screen.getByTestId('badge-super-admin')).toBeInTheDocument()
    expect(screen.getByTestId(`super-admin-protected-${mockSuperAdmin.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`btn-delete-user-${mockSuperAdmin.id}`)).toBeNull()

    // Admin e Usuário possuem botões de exclusão
    expect(screen.getByTestId(`btn-delete-user-${mockAdmin.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`btn-delete-user-${mockUser.id}`)).toBeInTheDocument()
  })

  it('permite abrir o modal de confirmação de exclusão para usuário comum', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId(`btn-delete-user-${mockUser.id}`)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId(`btn-delete-user-${mockUser.id}`))

    // Modal de confirmação aberto
    expect(screen.getByText('Excluir Usuário')).toBeInTheDocument()
    expect(screen.getByText('usuario@vturb.com')).toBeInTheDocument()

    // Confirma exclusão
    const confirmBtn = screen.getByText('Sim, Excluir')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(api.deleteUser).toHaveBeenCalledWith(mockUser.id)
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('removido com sucesso'))
    })
  })

  it('CreateInviteModal oferece apenas opções de Usuário e Admin e gera link com sucesso', async () => {
    const onClose = vi.fn()
    const onInviteCreated = vi.fn()
    const showToast = vi.fn()

    const newInvite: UserInvite = {
      id: 'inv-new',
      token: 'token-secret-xyz',
      role: 'admin',
      expires_at: '2026-09-12T12:00:00Z',
      is_used: false,
      created_at: '2026-09-11T12:00:00Z',
    }
    vi.mocked(api.createInvite).mockResolvedValue(newInvite)

    render(
      <CreateInviteModal
        isOpen={true}
        onClose={onClose}
        onInviteCreated={onInviteCreated}
        showToast={showToast}
      />
    )

    // Verifica que não existe opção de SuperAdmin para convite
    expect(screen.queryByText(/SuperAdmin/i)).toBeNull()
    expect(screen.getByTestId('role-option-user')).toBeInTheDocument()
    expect(screen.getByTestId('role-option-admin')).toBeInTheDocument()

    // Seleciona perfil Admin
    fireEvent.click(screen.getByTestId('role-option-admin'))

    // Seleciona expiração de 48 horas
    const selectExp = screen.getByTestId('select-expiration-hours')
    fireEvent.change(selectExp, { target: { value: '48' } })

    // Submete formulário
    fireEvent.click(screen.getByTestId('btn-submit-create-invite'))

    await waitFor(() => {
      expect(api.createInvite).toHaveBeenCalledWith({
        role: 'admin',
        duration_hours: 48,
      })
      expect(onInviteCreated).toHaveBeenCalledWith(newInvite)
    })

    // Exibe link gerado e botão de copiar
    expect(screen.getByTestId('invite-generated-box')).toBeInTheDocument()
    expect(screen.getByTestId('btn-copy-invite-link')).toBeInTheDocument()
  })

  it('permite alternar para a aba Convites Gerados e excluir um convite com confirmação', async () => {
    const showToast = vi.fn()
    render(<UserManagementView currentUser={mockSuperAdmin} showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('tab-generated-invites')).toBeInTheDocument()
    })

    // Alterna para a aba Convites Gerados
    fireEvent.click(screen.getByTestId('tab-generated-invites'))

    await waitFor(() => {
      expect(screen.getByTestId('invites-section')).toBeInTheDocument()
      expect(screen.getByTestId('btn-delete-invite-inv-1')).toBeInTheDocument()
    })

    // Clica para excluir convite
    fireEvent.click(screen.getByTestId('btn-delete-invite-inv-1'))

    // Modal de confirmação aberto
    expect(screen.getByText('Excluir Convite')).toBeInTheDocument()

    // Confirma exclusão
    const confirmBtn = screen.getByText('Sim, Excluir')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(api.deleteInvite).toHaveBeenCalledWith('inv-1')
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('excluído com sucesso'))
    })
  })
})
