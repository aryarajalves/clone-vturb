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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false)

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false)
    onLogout?.()
  }

  return (
    <>
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
                  {user.is_super_admin ? (
                    <span
                      data-testid="user-superadmin-badge"
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#f3e8ff',
                        color: '#7e22ce',
                        border: '1px solid #d8b4fe',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Super Admin
                    </span>
                  ) : user.role === 'admin' ? (
                    <span
                      data-testid="user-admin-badge"
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Admin
                    </span>
                  ) : null}
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  data-testid="btn-logout"
                  onClick={() => setIsLogoutModalOpen(true)}
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

      {/* Popup de Confirmação de Logout com Backdrop Escuro */}
      {isLogoutModalOpen && (
        <div
          data-testid="logout-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()} // NÃO fecha ao clicar fora
        >
          <div
            data-testid="logout-modal-content"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 32, 45, 0.95), rgba(20, 22, 30, 0.98))',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              color: '#f3f4f6',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#ef4444',
              }}
            >
              <LogOut size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ffffff' }}>
              Encerrar Sessão
            </h3>

            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
              Tem certeza de que deseja sair da sua conta e retornar para a tela inicial de login?
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                data-testid="logout-modal-cancel"
                onClick={() => setIsLogoutModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#d1d5db',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                data-testid="logout-modal-confirm"
                onClick={handleConfirmLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s',
                }}
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
