import React from 'react'
import { Plus, Play, LogOut } from 'lucide-react'
import type { User } from '../types/auth'

interface TopbarProps {
  totalPlays?: number
  onOpenImport: () => void
  showCreateButton?: boolean
  user?: User | null
  onLogout?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenImport,
  showCreateButton = true,
  user,
  onLogout,
}) => {
  return (
    <header
      data-testid="topbar"
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo VTurb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
          }}
        >
          <Play size={18} color="#ffffff" fill="#ffffff" style={{ marginLeft: '2px' }} />
        </div>
        <span
          data-testid="vturb-logo-text"
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.5px',
          }}
        >
          Clone do VTurb
        </span>
      </div>

      {/* Ações e Perfil do Usuário */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {showCreateButton && (
          <button
            type="button"
            data-testid="btn-novo-video"
            onClick={onOpenImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
              transition: 'background-color 0.2s',
            }}
          >
            <Plus size={16} />
            Novo Vídeo
          </button>
        )}

        {user && (
          <div
            data-testid="topbar-user-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingLeft: '1rem',
              borderLeft: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span
                  data-testid="user-email-display"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}
                >
                  {user.email}
                </span>
                {user.is_super_admin && (
                  <span
                    data-testid="user-superadmin-badge"
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                data-testid="btn-logout"
                onClick={onLogout}
                title="Sair da conta"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <LogOut size={14} />
                <span>Sair</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
