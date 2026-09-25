import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface DirectUnmuteBannerProps {
  buttonColor?: string
  text?: string
  buttonText?: string
  onUnmute: () => void
}

export const DirectUnmuteBanner: React.FC<DirectUnmuteBannerProps> = ({
  buttonColor = '#ef4444',
  text = 'Seu vídeo está sem som. Clique para ativar o áudio!',
  buttonText = 'OUVIR',
  onUnmute,
}) => {
  return (
    <div
      data-testid="direct-unmute-banner"
      onClick={(e) => {
        e.stopPropagation()
        onUnmute()
      }}
      style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 0.75rem',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(239, 68, 68, 0.3)',
        cursor: 'pointer',
        animation: 'pulse 2s infinite ease-in-out',
        userSelect: 'none',
        maxWidth: '94%',
        width: 'max-content',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: buttonColor,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 0 10px ${buttonColor}`,
        }}
      >
        <VolumeX size={15} />
      </div>
      <span
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        {text}
      </span>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.3rem 0.6rem',
          borderRadius: '30px',
          background: buttonColor,
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <Volume2 size={13} />
        {buttonText}
      </div>
    </div>
  )
}
