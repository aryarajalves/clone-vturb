import React from 'react'
import { Filter, Clock, MousePointerClick, CheckCircle2 } from 'lucide-react'
import type { VideoMetrics } from '../../../types/video'

interface RetentionFunnelSectionProps {
  metrics: VideoMetrics
}

export const RetentionFunnelSection: React.FC<RetentionFunnelSectionProps> = ({ metrics }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Funil de Retenção de Audiência */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#4f46e5" />
          Funil de Retenção de Audiência
        </h4>

        {Object.entries(metrics.retention).map(([mark, count]) => {
          const percentage =
            metrics.total_plays > 0
              ? Math.min(100, Math.round((count / metrics.total_plays) * 100))
              : 0
          return (
            <div key={mark} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#334155', fontWeight: 600 }}>Assistiram até {mark} do vídeo</span>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>
                  {count} views ({percentage}%)
                </span>
              </div>
              <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                    borderRadius: '6px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Cartões de Detalhe de Tempo e Conversão CTA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Tempo Médio Assistido */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Clock size={16} />
            <span>Retenção Média de Tempo</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
            {metrics.avg_watch_time_seconds}s
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            Média de permanência de cada espectador que iniciou a reprodução.
          </div>
        </div>

        {/* Cliques e Conversão no CTA */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <MousePointerClick size={16} />
            <span>Conversão do Botão CTA (CTR)</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
            {metrics.total_clicks} <span style={{ fontSize: '1rem', color: '#64748b' }}>({metrics.ctr}%)</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            Cliques em relação ao total de espectadores que assistiram ao vídeo.
          </div>
        </div>
      </div>
    </div>
  )
}
