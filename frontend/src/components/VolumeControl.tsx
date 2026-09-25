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

      {/* Slider deslizante que surge suavemente ao passar o mouse ou interagir */}
      <div
        data-testid={`${testIdPrefix}-volume-slider-wrapper`}
        style={{
          width: isHovered ? '68px' : '0px',
          opacity: isHovered ? 1 : 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease, opacity 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          marginLeft: isHovered ? '4px' : '0px',
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
            width: '64px',
            height: '4px',
            accentColor: primaryColor,
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  )
}
