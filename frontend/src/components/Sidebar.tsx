import React from 'react'
import { Video as VideoIcon } from 'lucide-react'

export const Sidebar: React.FC = () => {
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.08)',
          }}
        >
          <VideoIcon size={20} color="#0284c7" />
          <span>Meus vídeos</span>
        </button>
      </nav>
    </aside>
  )
}
