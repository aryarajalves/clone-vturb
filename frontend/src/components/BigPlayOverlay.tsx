import React from 'react'
import { Play } from 'lucide-react'

interface BigPlayOverlayProps {
  primaryColor: string
  shape?: 'circle' | 'rounded' | 'square' | 'minimal'
  size?: 'small' | 'medium' | 'large'
  onPlay: () => void
}

export const BigPlayOverlay: React.FC<BigPlayOverlayProps> = ({
  primaryColor,
  shape = 'circle',
  size = 'medium',
  onPlay,
}) => {
  const sizePx = size === 'small' ? 56 : size === 'large' ? 104 : 80
  const iconPx = size === 'small' ? 26 : size === 'large' ? 50 : 38
  const borderRadius =
    shape === 'rounded' ? '18px' : shape === 'square' ? '8px' : '50%'
  const buttonBg = shape === 'minimal' ? 'rgba(10, 12, 18, 0.75)' : primaryColor
  const buttonBorder = shape === 'minimal' ? `3px solid ${primaryColor}` : 'none'

  return (
    <div
      data-testid="big-play-overlay"
      onClick={onPlay}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div
        data-testid="big-play-button"
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          borderRadius,
          background: buttonBg,
          border: buttonBorder,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 35px ${primaryColor}99`,
          transition: 'transform 0.2s',
        }}
      >
        <Play size={iconPx} color="#fff" style={{ marginLeft: '4px' }} />
      </div>
    </div>
  )
}
