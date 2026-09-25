import React from 'react'
import { X } from 'lucide-react'

interface EmbedFloatingCloseButtonProps {
  isFloatingActive: boolean
  closeable?: boolean
  onClose: () => void
}

export const EmbedFloatingCloseButton: React.FC<EmbedFloatingCloseButtonProps> = ({
  isFloatingActive,
  closeable = true,
  onClose,
}) => {
  if (!isFloatingActive || closeable === false) return null

  return (
    <button
      data-testid="floating-player-close"
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(0, 0, 0, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 20,
      }}
      title="Fechar player flutuante"
    >
      <X size={16} />
    </button>
  )
}
