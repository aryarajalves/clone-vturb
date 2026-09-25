import React, { useState } from 'react'
import { Volume2, Volume1, VolumeX } from 'lucide-react'

interface VolumeControlProps {
  volume: number // 0 to 1
  isMuted: boolean
  primaryColor?: string
  onVolumeChange: (newVolume: number) => void
  onToggleMute: () => void
  testIdPrefix?: string
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  primaryColor = '#6366f1',
  onVolumeChange,
  onToggleMute,
  testIdPrefix = 'embed',
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const effectiveVolume = isMuted ? 0 : volume

  const renderIcon = () => {
    if (effectiveVolume === 0 || isMuted) {
      return <VolumeX size={18} />
    }
    if (effectiveVolume < 0.5) {
      return <Volume1 size={18} />
    }
    return <Volume2 size={18} />
  }

  return (
    <div
      data-testid={`${testIdPrefix}-volume-container`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <button
        type="button"
        data-testid={`${testIdPrefix}-control-volume`}
        onClick={onToggleMute}
        title={isMuted ? 'Desmutar som' : 'Mutar som'}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderIcon()}
      </button>

      {/* Slider Vertical em popup acima do ícone para não expandir para a direita */}
      <div
        data-testid={`${testIdPrefix}-volume-slider-wrapper`}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '8px',
          padding: '8px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease, visibility 0.2s ease',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          zIndex: 50,
          width: '28px',
          height: '84px',
          marginBottom: '4px',
        }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={effectiveVolume}
          data-testid={`${testIdPrefix}-volume-slider`}
          title={`Volume: ${Math.round(effectiveVolume * 100)}%`}
          onChange={(e) => {
            const val = parseFloat(e.target.value)
            onVolumeChange(val)
          }}
          style={{
            WebkitAppearance: 'slider-vertical' as any,
            writingMode: 'vertical-lr',
            direction: 'rtl',
            width: '6px',
            height: '70px',
            accentColor: primaryColor,
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  )
}
