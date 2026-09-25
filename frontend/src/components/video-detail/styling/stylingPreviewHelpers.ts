export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function getButtonRadius(playShape: 'circle' | 'rounded' | 'square' | 'minimal'): string {
  return playShape === 'circle' || playShape === 'minimal' ? '50%' : playShape === 'rounded' ? '18px' : '8px'
}

export function getPlayPixelSize(playSize: 'small' | 'medium' | 'large'): number {
  return playSize === 'small' ? 56 : playSize === 'large' ? 96 : 76
}
