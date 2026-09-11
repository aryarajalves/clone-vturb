import React, { useEffect, useState } from 'react'
import { X, BarChart3, Eye, Users, Play, UserCheck, MousePointerClick, Clock, RotateCcw } from 'lucide-react'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import type { Video, VideoMetrics } from '../types/video'
import { fetchVideoMetrics } from '../services/api'

interface MetricsModalProps {
  video: Video | null
  isOpen: boolean
  onClose: () => void
}

export const MetricsModal: React.FC<MetricsModalProps> = ({ video, isOpen, onClose }) => {
  useLockBodyScroll(isOpen)

  const [metrics, setMetrics] = useState<VideoMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = async () => {
    if (!video) return
    try {
      setLoading(true)
      setError(null)
      const data = await fetchVideoMetrics(video.id)
      setMetrics(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar métricas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && video) {
      loadMetrics()
    }
  }, [isOpen, video])

  if (!isOpen || !video) return null

  return (
    <div
      data-testid="metrics-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-testid="metrics-modal-content"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 29, 43, 0.95), rgba(16, 18, 27, 0.98))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '640px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.2)',
          color: '#f3f4f6',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BarChart3 size={22} color="#3b82f6" />
              Métricas de Performance
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Vídeo: <strong>"{video.title}"</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={loadMetrics}
              disabled={loading}
              title="Recarregar Métricas"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#9ca3af',
                borderRadius: '8px',
                padding: '0.4rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#f87171', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            Carregando telemetria...
          </div>
        ) : metrics ? (
          <>
            {/* Grid de KPIs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <Eye size={14} color="#60a5fa" /> Impressões Totais
                </div>
                <div data-testid="metric-total-impressions" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f3f4f6' }}>
                  {metrics.total_impressions}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <Users size={14} color="#60a5fa" /> Impressões Únicas
                </div>
                <div data-testid="metric-unique-impressions" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#60a5fa' }}>
                  {metrics.unique_impressions ?? metrics.total_impressions}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <Play size={14} color="#34d399" /> Plays Totais
                </div>
                <div data-testid="metric-total-plays" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f3f4f6' }}>
                  {metrics.total_plays}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6ee7b7', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <UserCheck size={14} color="#34d399" /> Plays Únicos
                </div>
                <div data-testid="metric-unique-plays" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399' }}>
                  {metrics.unique_plays ?? metrics.total_plays}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  Play Rate
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>{metrics.play_rate}%</div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <MousePointerClick size={14} color="#f59e0b" /> Cliques / CTR
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b' }}>
                  {metrics.total_clicks} <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>({metrics.ctr}%)</span>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <Clock size={14} color="#a78bfa" /> Tempo Médio
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#a78bfa' }}>{metrics.avg_watch_time_seconds}s</div>
              </div>
            </div>

            {/* Retenção da Audiência */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c7d2fe', marginBottom: '1rem' }}>
                Funil de Retenção de Visualização
              </h4>

              {Object.entries(metrics.retention).map(([mark, count]) => {
                const percentage = metrics.total_plays > 0 ? Math.min(100, Math.round((count / metrics.total_plays) * 100)) : 0
                return (
                  <div key={mark} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#d1d5db' }}>Assistiram até {mark} do vídeo</span>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>{count} views ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#d1d5db',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
