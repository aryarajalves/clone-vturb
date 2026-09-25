import React from 'react'
import { ArrowLeft, Video as VideoIcon } from 'lucide-react'

interface VideoCreateHeaderProps {
  onBack: () => void
}

export const VideoCreateHeader: React.FC<VideoCreateHeaderProps> = ({ onBack }) => {
  return (
    <div
      data-testid="create-header"
      style={{
        height: '65px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          type="button"
          data-testid="back-to-videos-btn"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          <ArrowLeft size={16} />
          VOLTAR AOS VÍDEOS
        </button>

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideoIcon size={18} />
          </div>
          <h1
            data-testid="create-view-title"
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#1e293b',
              margin: 0,
            }}
          >
            Novo Vídeo
          </h1>
        </div>
      </div>
    </div>
  )
}
