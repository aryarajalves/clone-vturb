import React, { useState } from 'react'
import { Flame, Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import type { VideoMetrics } from '../../../types/video'

interface HourlyPeakSectionProps {
  metrics: VideoMetrics
}

export const HourlyPeakSection: React.FC<HourlyPeakSectionProps> = ({ metrics }) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)

  const hourlyList = metrics.hourly_distribution || []
  const peak = metrics.peak_hour

  // Encontra a maior atividade para escala do gráfico
  const maxActivity = Math.max(
    ...hourlyList.map((h) => Math.max(h.impressions, h.plays)),
    1
  )

  // Agregação por turnos
  const periods = {
    dawn: hourlyList.filter((h) => h.hour >= 0 && h.hour < 6).reduce((acc, cur) => acc + cur.plays, 0),
    morning: hourlyList.filter((h) => h.hour >= 6 && h.hour < 12).reduce((acc, cur) => acc + cur.plays, 0),
    afternoon: hourlyList.filter((h) => h.hour >= 12 && h.hour < 18).reduce((acc, cur) => acc + cur.plays, 0),
    night: hourlyList.filter((h) => h.hour >= 18 && h.hour <= 23).reduce((acc, cur) => acc + cur.plays, 0),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Destaque: Horário de Maior Pico */}
      <div
        data-testid="peak-hour-card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '14px',
          padding: '1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(49, 46, 129, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
            }}
          >
            <Flame size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fcd34d', fontWeight: 700 }}>
              Horário com Maior Volume de Acessos
            </div>
            <div data-testid="peak-hour-label" style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {peak ? `${peak.label}` : 'Sem dados suficientes no período'}
            </div>
            {peak && (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Pico registrado com <strong style={{ color: '#10b981' }}>{peak.plays} reproduções</strong> e <strong style={{ color: '#93c5fd' }}>{peak.impressions} visualizações</strong>.
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.75rem 1.25rem', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Fuso Horário</div>
          <div data-testid="timezone-badge" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
            Horário de Brasília (BRT / UTC-3)
          </div>
        </div>
      </div>

      {/* Gráfico Estilo VTurb: 24 Horas do Dia */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#4f46e5" />
              Distribuição por Horário do Dia (24h)
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Visualizações e inícios de play distribuídos entre as 00:00 e 23:59 (Horário de Brasília).
            </span>
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} />
              <span>Impressões</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
              <span>Plays</span>
            </div>
          </div>
        </div>

        {/* Área das Barras */}
        <div
          data-testid="hourly-chart-container"
          style={{
            height: '240px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            padding: '2rem 0.5rem 0.5rem',
            borderBottom: '2px solid #e2e8f0',
            position: 'relative',
          }}
        >
          {hourlyList.map((item) => {
            const isPeak = peak && peak.hour === item.hour && peak.total_activity > 0
            const imprHeight = Math.max((item.impressions / maxActivity) * 100, item.impressions > 0 ? 8 : 2)
            const playHeight = Math.max((item.plays / maxActivity) * 100, item.plays > 0 ? 8 : 2)
            const isHovered = hoveredHour === item.hour

            return (
              <div
                key={item.hour}
                onMouseEnter={() => setHoveredHour(item.hour)}
                onMouseLeave={() => setHoveredHour(null)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Tooltip flutuante ao passar o mouse */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '105%',
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      pointerEvents: 'none',
                    }}
                  >
                    <strong>{item.label}</strong>
                    <div>Plays: {item.plays}</div>
                    <div>Views: {item.impressions}</div>
                  </div>
                )}

                {/* Badge de Pico */}
                {isPeak && (
                  <div
                    data-testid="peak-badge"
                    style={{
                      position: 'absolute',
                      top: '-24px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.35rem',
                      borderRadius: '4px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    PICO
                  </div>
                )}

                {/* Par de Barras (Impressões e Plays) */}
                <div style={{ display: 'flex', gap: '2px', width: '100%', alignItems: 'flex-end', height: '100%' }}>
                  {/* Barra de Impressões */}
                  <div
                    style={{
                      flex: 1,
                      height: `${imprHeight}%`,
                      background: isPeak ? '#60a5fa' : isHovered ? '#2563eb' : '#93c5fd',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s ease, background 0.15s ease',
                    }}
                  />
                  {/* Barra de Plays */}
                  <div
                    style={{
                      flex: 1,
                      height: `${playHeight}%`,
                      background: isPeak ? '#10b981' : isHovered ? '#059669' : '#34d399',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s ease, background 0.15s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Eixo X com Horas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Cards de Desempenho por Turnos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Moon size={22} color="#6366f1" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Madrugada (00h - 06h)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{periods.dawn} plays</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sunrise size={22} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Manhã (06h - 12h)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{periods.morning} plays</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sun size={22} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tarde (12h - 18h)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{periods.afternoon} plays</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sunset size={22} color="#ef4444" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Noite (18h - 24h)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{periods.night} plays</div>
          </div>
        </div>
      </div>
    </div>
  )
}
