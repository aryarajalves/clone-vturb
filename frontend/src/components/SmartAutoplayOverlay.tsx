import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { SmartAutoplaySettings } from '../types/video'

interface SmartAutoplayOverlayProps {
  settings?: SmartAutoplaySettings
  onUnmute: () => void
}

export const SmartAutoplayOverlay: React.FC<SmartAutoplayOverlayProps> = ({
  settings,
  onUnmute,
}) => {
  const buttonColor = settings?.button_color || '#ef4444'

  return (
    <div
      data-testid="smart-autoplay-overlay"
      onClick={onUnmute}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
        cursor: 'pointer',
        padding: '1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '1.75rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '440px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <VolumeX size={30} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
          {settings?.text || 'Seu vídeo já começou!'}
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
          {settings?.subtext || 'Clique no botão abaixo para ativar o som'}
        </p>
        <button
          data-testid="smart-autoplay-unmute-btn"
          onClick={(e) => {
            e.stopPropagation()
            onUnmute()
          }}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '50px',
            background: buttonColor,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 8px 25px ${buttonColor}88`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <Volume2 size={20} />
          {settings?.button_text || 'CLIQUE PARA OUVIR'}
        </button>
      </div>
    </div>
  )
}
