import React from 'react'
import { Video as VideoIcon, Users } from 'lucide-react'

interface SidebarProps {
  currentTab?: 'videos' | 'users'
  onSelectTab?: (tab: 'videos' | 'users') => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = 'videos',
  onSelectTab,
}) => {
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
      </nav>
    </aside>
  )
}
