import React from 'react'
import { Video as VideoIcon, Users } from 'lucide-react'
import type { User } from '../types/auth'

interface SidebarProps {
  currentTab?: 'videos' | 'users'
  onSelectTab?: (tab: 'videos' | 'users') => void
  user?: User | null
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = 'videos',
  onSelectTab,
  user,
}) => {
  const getDisplayName = (u: User | null | undefined): string => {
    if (!u) return ''
    if (u.name && u.name.trim()) return u.name.trim()
    if (u.is_super_admin) return 'Super Admin'
    if (!u.email) return 'Usuário'
    const raw = u.email.split('@')[0] || 'Usuário'
    const clean = raw.replace(/[._-]/g, ' ')
    return (
      clean
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Usuário'
    )
  }

  const displayName = getDisplayName(user)
  const initialLetter = (displayName.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()

  return (
    <aside
      data-testid="sidebar"
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          type="button"
          data-testid="nav-meus-videos"
          onClick={() => onSelectTab?.('videos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: currentTab === 'videos' ? '#e0f2fe' : 'transparent',
            color: currentTab === 'videos' ? '#0284c7' : '#64748b',
            fontWeight: currentTab === 'videos' ? 600 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: currentTab === 'videos' ? '0 2px 4px rgba(2, 132, 199, 0.08)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <VideoIcon size={20} color={currentTab === 'videos' ? '#0284c7' : '#64748b'} />
          <span>Meus vídeos</span>
        </button>

        {/* Botão de Gestão de Usuário visível estritamente para SuperAdmin */}
        {user?.is_super_admin && (
          <button
            type="button"
            data-testid="nav-gestao-usuarios"
            onClick={() => onSelectTab?.('users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.85rem 1.15rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: currentTab === 'users' ? '#e0f2fe' : 'transparent',
              color: currentTab === 'users' ? '#0284c7' : '#64748b',
              fontWeight: currentTab === 'users' ? 600 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: currentTab === 'users' ? '0 2px 4px rgba(2, 132, 199, 0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={20} color={currentTab === 'users' ? '#0284c7' : '#64748b'} />
            <span>Gestão de Usuário</span>
          </button>
        )}
      </nav>

      {/* Card com Nome e E-mail do Usuário Logado na Base da Barra Lateral */}
      {user && (
        <div
          data-testid="sidebar-user-profile"
          style={{
            marginTop: 'auto',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            data-testid="sidebar-user-avatar"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: user.is_super_admin
                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                : 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.95rem',
              flexShrink: 0,
              boxShadow: user.is_super_admin
                ? '0 2px 6px rgba(124, 58, 237, 0.25)'
                : '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            {initialLetter}
          </div>
          <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span
              data-testid="sidebar-user-name"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayName}
            >
              {displayName}
            </span>
            <span
              data-testid="sidebar-user-email"
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={user.email}
            >
              {user.email}
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}
