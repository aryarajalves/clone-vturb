import React from 'react'

interface EmbedBufferingOverlayProps {
  isVideoReady: boolean
  primaryColor: string
}

export const EmbedBufferingOverlay: React.FC<EmbedBufferingOverlayProps> = ({
  isVideoReady,
  primaryColor,
}) => {
  if (isVideoReady) return null

  return (
    <div
      data-testid="embed-buffering-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255, 255, 255, 0.12)',
          borderTopColor: primaryColor,
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
    </div>
  )
}
