import React from 'react'
import { Plus, Play } from 'lucide-react'

interface TopbarProps {
  totalPlays?: number
  onOpenImport: () => void
  showCreateButton?: boolean
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenImport, showCreateButton = true }) => {
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

      {/* Botão Novo Vídeo (visível apenas fora da tela de edição) */}
      <div>
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
      </div>
    </header>
  )
}
