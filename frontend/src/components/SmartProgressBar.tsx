import React from 'react'
import type { ChapterItem, SmartProgressSettings } from '../types/video'
import { mapChapterSegments, toVisualFraction } from '../utils/smartProgress'

interface SmartProgressBaseProps {
  testId: string
  currentTime: number
  duration: number
  settings: SmartProgressSettings
  primaryColor: string
}

const trackStyle: React.CSSProperties = {
  height: '4px',
  backgroundColor: 'rgba(255,255,255,0.25)',
  borderRadius: '2px',
  overflow: 'hidden',
}

const fillStyle = (widthPct: number, color: string): React.CSSProperties => ({
  width: `${widthPct}%`,
  height: '100%',
  backgroundColor: color,
  borderRadius: '2px',
  transition: 'width 250ms linear',
})

/** Barra do Progresso Inteligente: só visual, sem arrastar nem clicar. */
export const SmartProgressBar: React.FC<SmartProgressBaseProps> = ({
  testId,
  currentTime,
  duration,
  settings,
  primaryColor,
}) => {
  const pct = Math.round(toVisualFraction(currentTime, duration, settings) * 1000) / 10

  return (
    <div
      data-testid={testId}
      role="progressbar"
      aria-label="Progresso do vídeo"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      style={{ ...trackStyle, width: '100%', margin: '5px 0' }}
    >
      <div data-testid={`${testId.replace(/-bar$/, '')}-fill`} style={fillStyle(pct, primaryColor)} />
    </div>
  )
}

interface SmartChaptersBarProps extends SmartProgressBaseProps {
  segmentTestIdPrefix: string
  items: ChapterItem[]
}

/** Capítulos com o Progresso Inteligente: limites e preenchimento seguem a curva; sem navegação. */
export const SmartChaptersBar: React.FC<SmartChaptersBarProps> = ({
  testId,
  segmentTestIdPrefix,
  items,
  currentTime,
  duration,
  settings,
  primaryColor,
}) => {
  const sorted = [...items].sort((a, b) => a.seconds - b.seconds)
  const segments = mapChapterSegments(sorted, duration, currentTime, settings)

  return (
    <div
      data-testid={testId}
      style={{ display: 'flex', alignItems: 'center', gap: '3px', width: '100%', height: '6px', padding: '2px 0' }}
    >
      {sorted.map((chap, idx) => (
        <div
          key={chap.id || idx}
          data-testid={`${segmentTestIdPrefix}${idx}`}
          title={chap.title || `Capítulo ${idx + 1}`}
          style={{ ...trackStyle, flex: `${segments[idx].widthPct} 0 0`, position: 'relative' }}
        >
          <div style={fillStyle(segments[idx].fillPct, primaryColor)} />
        </div>
      ))}
    </div>
  )
}
