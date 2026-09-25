import React, { useState, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { Video, VideoMetrics } from '../../../types/video'
import { getMediaUrl } from '../../../services/api'
import { VTurbMetricsBreakdown, type BreakdownTab } from './VTurbMetricsBreakdown'

interface VTurbRetentionChartProps {
  video: Video
  metrics: VideoMetrics
  defaultTab?: 'retention' | 'hourly' | BreakdownTab
}

type ChartTab = 'retention' | 'hourly' | BreakdownTab

export const VTurbRetentionChart: React.FC<VTurbRetentionChartProps> = ({
  video,
  metrics,
  defaultTab = 'retention',
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>(defaultTab)
  const [showConversions, setShowConversions] = useState(false)
  const [cursorPercent, setCursorPercent] = useState<number>(44) // Ponto padrão 44% (~01:05) como na Imagem 01
  const chartRef = useRef<HTMLDivElement>(null)

  const duration = video.duration > 0 ? video.duration : 147 // 147s = 02:27 padrão da imagem de referência
  const totalPlays = metrics.total_plays || 0
  const hourlyList = metrics.hourly_distribution || []

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Marcadores de tempo do eixo X
  const timeTicks = [
    formatTime(0),
    formatTime(Math.round(duration * 0.27)),
    formatTime(Math.round(duration * 0.54)),
    formatTime(Math.round(duration * 0.81)),
    formatTime(duration),
  ]

  const hourlyTicks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00']

  // Cálculo da porcentagem de retenção em cada marco (0%, 25%, 50%, 75%, 100%)
  const retentionValues = {
    0: totalPlays > 0 ? 100 : 0,
    25: totalPlays > 0 ? ((metrics.retention['25%'] || 0) / totalPlays) * 100 : 0,
    50: totalPlays > 0 ? ((metrics.retention['50%'] || 0) / totalPlays) * 100 : 0,
    75: totalPlays > 0 ? ((metrics.retention['75%'] || 0) / totalPlays) * 100 : 0,
    100: totalPlays > 0 ? ((metrics.retention['100%'] || 0) / totalPlays) * 100 : 0,
  }

  // Interpolação para o modo de retenção baseada em espectadores reais
  const audienceBase = metrics.unique_plays > 0 ? metrics.unique_plays : totalPlays

  const getInterpolatedRetention = (pct: number) => {
    if (totalPlays === 0) return { retention: 0, audience: 0 }
    let ret = 0

    if (pct <= 25) {
      const factor = pct / 25
      ret = retentionValues[0] + factor * (retentionValues[25] - retentionValues[0])
    } else if (pct <= 50) {
      const factor = (pct - 25) / 25
      ret = retentionValues[25] + factor * (retentionValues[50] - retentionValues[25])
    } else if (pct <= 75) {
      const factor = (pct - 50) / 25
      ret = retentionValues[50] + factor * (retentionValues[75] - retentionValues[50])
    } else {
      const factor = (pct - 75) / 25
      ret = retentionValues[75] + factor * (retentionValues[100] - retentionValues[75])
    }

    const finalRet = Math.max(0, Math.min(100, ret))
    const aud = Math.round((finalRet / 100) * audienceBase)

    return {
      retention: finalRet,
      audience: Math.max(0, aud),
    }
  }

  // Dados para o modo horário (24h)
  const maxActivity = Math.max(
    ...hourlyList.map((h) => Math.max(h.impressions, h.plays)),
    1
  )
  const selectedHourIndex = Math.min(23, Math.floor((cursorPercent / 100) * 24))
  const selectedHourData = hourlyList[selectedHourIndex] || {
    hour: selectedHourIndex,
    label: `${String(selectedHourIndex).padStart(2, '0')}:00`,
    impressions: 0,
    plays: 0,
  }

  const currentRetentionData = getInterpolatedRetention(cursorPercent)
  const currentSecs = Math.round((cursorPercent / 100) * duration)
  const currentTimeFormatted = formatTime(currentSecs)

  // Mapeamento Y para SVG (altura 200, base y=190, topo y=15)
  const getYCoordinate = (percent: number) => {
    return 190 - (percent / 100) * 175
  }

  // Caminho SVG para modo retenção
  const p0 = { x: 0, y: getYCoordinate(retentionValues[0]) }
  const p25 = { x: 250, y: getYCoordinate(retentionValues[25]) }
  const p50 = { x: 500, y: getYCoordinate(retentionValues[50]) }
  const p75 = { x: 750, y: getYCoordinate(retentionValues[75]) }
  const p100 = { x: 1000, y: getYCoordinate(retentionValues[100]) }

  const retentionPathD = `M ${p0.x},${p0.y} C 125,${p0.x === 0 ? p0.y : p0.y} 125,${p25.y} ${p25.x},${p25.y} C 375,${p25.y} 375,${p50.y} ${p50.x},${p50.y} C 625,${p50.y} 625,${p75.y} ${p75.x},${p75.y} C 875,${p75.y} 875,${p100.y} ${p100.x},${p100.y}`
  const retentionAreaD = `${retentionPathD} L 1000,190 L 0,190 Z`

  // Caminho SVG para modo horários (24h)
  const hourlyPoints = hourlyList.map((item, idx) => {
    const x = (idx / 23) * 1000
    const pct = (item.plays / maxActivity) * 100
    const y = getYCoordinate(pct)
    return { x, y }
  })
  const hourlyPathD = hourlyPoints.length > 0
    ? hourlyPoints.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`), '')
    : 'M 0,190 L 1000,190'
  const hourlyAreaD = `${hourlyPathD} L 1000,190 L 0,190 Z`

  const activePathD = activeTab === 'hourly' ? hourlyPathD : retentionPathD
  const activeAreaD = activeTab === 'hourly' ? hourlyAreaD : retentionAreaD

  // Posição vertical do ponto no scrubber
  const dotYPct = activeTab === 'hourly'
    ? 100 - (selectedHourData.plays / maxActivity) * 100
    : totalPlays > 0
    ? 100 - currentRetentionData.retention
    : 98

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)))
    setCursorPercent(pct)
  }

  const tabs: { id: ChartTab; label: string }[] = [
    { id: 'retention', label: 'Retenção Geral' },
    { id: 'hourly', label: 'Melhores Horários (24h)' },
    { id: 'countries', label: 'Países' },
    { id: 'devices', label: 'Dispositivos' },
    { id: 'os', label: 'Sistema Operacional' },
    { id: 'browsers', label: 'Navegadores' },
    { id: 'traffic', label: 'Origem do Tráfego' },
  ]

  const isGraphView = activeTab === 'retention' || activeTab === 'hourly'

  return (
    <div
      data-testid="vturb-retention-chart"
      style={{
        background: '#0a0c10',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        color: '#ffffff',
        border: '1px solid #1e293b',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Barra de Navegação de Métricas no Topo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`vturb-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  padding: '0.4rem 0.2rem',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Lado Direito: Toggle Conversões & Info de Atualização */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <label
            data-testid="vturb-toggle-conversions"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <span>Conversões</span>
            <div
              onClick={() => setShowConversions(!showConversions)}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '10px',
                background: showConversions ? '#10b981' : '#334155',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: showConversions ? '18px' : '2px',
                  transition: 'left 0.2s ease',
                }}
              />
            </div>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
            <RotateCcw size={13} />
            <span>Atualizado há 2 minutos</span>
          </div>
        </div>
      </div>

      {/* Gráfico Estilo Imagem 01 com Vídeo Centralizado */}
      {isGraphView ? (
        <div>
          <div
            style={{
              display: 'flex',
              position: 'relative',
              height: '260px',
              userSelect: 'none',
            }}
          >
            {/* Eixo Y com Porcentagens */}
            <div
              style={{
                width: '45px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingRight: '0.5rem',
                fontSize: '0.72rem',
                color: '#64748b',
                fontWeight: 600,
                textAlign: 'right',
                marginBottom: '15px',
              }}
            >
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
              <span>0%</span>
            </div>

            {/* Área Principal do Gráfico */}
            <div
              ref={chartRef}
              data-testid="vturb-chart-canvas"
              onMouseMove={handleMouseMove}
              style={{
                flex: 1,
                position: 'relative',
                background: '#000000',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'crosshair',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Linhas de Grade Horizontais */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 0 20px', pointerEvents: 'none' }}>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', width: '100%' }} />
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', width: '100%' }} />
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', width: '100%' }} />
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', width: '100%' }} />
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', width: '100%' }} />
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', width: '100%' }} />
              </div>

              {/* Imagem Central do Vídeo Estilo VTurb */}
              <div
                data-testid="vturb-chart-video-thumbnail"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '10px',
                  bottom: '20px',
                  transform: 'translateX(-50%)',
                  width: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 0 25px rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                {video.thumbnail_url ? (
                  <img
                    src={getMediaUrl(video.thumbnail_url)}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.95,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(180deg, #1e293b 0%, #090d16 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      padding: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <Play size={26} color="#10b981" />
                    <span style={{ fontSize: '0.72rem', marginTop: '0.4rem', fontWeight: 600 }}>{video.title}</span>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)',
                  }}
                />
              </div>

              {/* Curva SVG Neon de Retenção e Audiência */}
              <svg
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <defs>
                  <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={activeAreaD} fill="url(#neonGradient)" />
                <path
                  data-testid="vturb-neon-retention-curve"
                  d={activePathD}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.75))',
                  }}
                />
                {showConversions && (
                  <line
                    x1="0"
                    y1={getYCoordinate(metrics.ctr)}
                    x2="1000"
                    y2={getYCoordinate(metrics.ctr)}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>

              {/* Scrubber Interativo: Linha Vertical Tracejada e Ponto */}
              <div
                data-testid="vturb-chart-scrubber"
                style={{
                  position: 'absolute',
                  left: `${cursorPercent}%`,
                  top: '10px',
                  bottom: '20px',
                  width: '1px',
                  borderLeft: '1px dashed rgba(255, 255, 255, 0.55)',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              >
                {/* Ponto Verde no cruzamento */}
                <div
                  data-testid="vturb-chart-dot"
                  style={{
                    position: 'absolute',
                    top: `${dotYPct}%`,
                    left: '-5px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 10px #22c55e',
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Card de Tooltip Flutuante Estilo VTurb Oficial */}
                <div
                  data-testid="vturb-chart-tooltip"
                  style={{
                    position: 'absolute',
                    top: cursorPercent > 50 && dotYPct > 50 ? '30%' : '45%',
                    left: cursorPercent > 65 ? '-185px' : '15px',
                    width: '165px',
                    background: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    data-testid="vturb-tooltip-header"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      marginBottom: '0.45rem',
                      color: '#f8fafc',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '0.3rem',
                    }}
                  >
                    {activeTab === 'hourly'
                      ? `${selectedHourData.label} - ${(selectedHourData.hour + 1) % 24}:00`
                      : `${currentTimeFormatted} - ${cursorPercent}%`}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                      Audiência
                    </span>
                    <strong data-testid="vturb-tooltip-audience" style={{ color: '#ffffff' }}>
                      {activeTab === 'hourly' ? selectedHourData.plays : currentRetentionData.audience}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                      {activeTab === 'hourly' ? 'Visualizações' : 'Retenção'}
                    </span>
                    <strong data-testid="vturb-tooltip-retention" style={{ color: '#ffffff' }}>
                      {activeTab === 'hourly'
                        ? selectedHourData.impressions
                        : `${currentRetentionData.retention.toFixed(2).replace('.', ',')}%`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Eixo X com Timestamps ou Horários */}
          <div
            data-testid="vturb-chart-x-axis"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingLeft: '45px',
              paddingTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            {(activeTab === 'hourly' ? hourlyTicks : timeTicks).map((tick, idx) => (
              <span key={idx}>{tick}</span>
            ))}
          </div>
        </div>
      ) : (
        <VTurbMetricsBreakdown tab={activeTab as BreakdownTab} />
      )}
    </div>
  )
}
