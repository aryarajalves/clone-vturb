import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Topbar } from '../components/Topbar'
import type { User } from '../types/auth'

const mockSuperAdmin: User = {
  id: 'super-1',
  email: 'aryarajmarketing@gmail.com',
  name: 'Arya Raj',
  role: 'super_admin',
  is_super_admin: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockNormalAdmin: User = {
  id: 'admin-2',
  email: 'gerente@vturb.com',
  name: 'Gerente',
  role: 'admin',
  is_super_admin: false,
  created_at: '2026-01-01T00:00:00Z',
}

describe('Topbar - Identificação do Super Admin e Modal de Logout', () => {
  it('exibe badge Super Admin em roxo para o Super Admin', () => {
    const onLogout = vi.fn()
    render(<Topbar user={mockSuperAdmin} onOpenImport={vi.fn()} onLogout={onLogout} />)

    expect(screen.getByTestId('user-superadmin-badge')).toBeInTheDocument()
    expect(screen.getByText('aryarajmarketing@gmail.com')).toBeInTheDocument()
  })

  it('exibe badge Admin para administradores comuns', () => {
    const onLogout = vi.fn()
    render(<Topbar user={mockNormalAdmin} onOpenImport={vi.fn()} onLogout={onLogout} />)

    expect(screen.getByTestId('user-admin-badge')).toBeInTheDocument()
  })

  it('abre popup de confirmação ao clicar em Sair e só desloga ao confirmar', () => {
    const onLogout = vi.fn()
    render(<Topbar user={mockSuperAdmin} onOpenImport={vi.fn()} onLogout={onLogout} />)

    const logoutBtn = screen.getByTestId('btn-logout')
    fireEvent.click(logoutBtn)

    // Modal aberto
    expect(screen.getByText('Encerrar Sessão')).toBeInTheDocument()
    expect(screen.getByTestId('logout-modal-backdrop')).toBeInTheDocument()
    expect(onLogout).not.toHaveBeenCalled()

    // Clica em Cancelar
    fireEvent.click(screen.getByTestId('logout-modal-cancel'))
    expect(screen.queryByText('Encerrar Sessão')).not.toBeInTheDocument()
    expect(onLogout).not.toHaveBeenCalled()

    // Abre novamente e confirma
    fireEvent.click(logoutBtn)
    fireEvent.click(screen.getByTestId('logout-modal-confirm'))
    expect(onLogout).toHaveBeenCalled()
  })
})
