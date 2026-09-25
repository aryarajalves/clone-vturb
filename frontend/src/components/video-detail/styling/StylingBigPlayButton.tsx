import React from 'react'
import { Play } from 'lucide-react'
import { getButtonRadius, getPlayPixelSize } from './stylingPreviewHelpers'

interface StylingBigPlayButtonProps {
  isPlaying: boolean
  playShape: 'circle' | 'rounded' | 'square' | 'minimal'
  playSize: 'small' | 'medium' | 'large'
  primaryColor: string
  onTogglePlay: () => void
}

export const StylingBigPlayButton: React.FC<StylingBigPlayButtonProps> = ({
  isPlaying,
  playShape,
  playSize,
  primaryColor,
  onTogglePlay,
}) => {
  if (isPlaying) return null

  const pixelSize = getPlayPixelSize(playSize)
  const borderRadius = getButtonRadius(playShape)

  return (
    <div
      data-testid="styling-big-play-btn"
      onClick={onTogglePlay}
      style={{
        position: 'absolute',
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        borderRadius,
        backgroundColor: playShape === 'minimal' ? 'rgba(0,0,0,0.65)' : primaryColor,
        border: playShape === 'minimal' ? `3px solid ${primaryColor}` : 'none',
        boxShadow: `0 0 25px ${primaryColor}77`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <Play size={pixelSize * 0.45} fill="#ffffff" color="#ffffff" style={{ marginLeft: '4px' }} />
    </div>
  )
}
