import React, { useEffect, useState, useCallback } from 'react'
import { BarChart3, Clock, Filter, RotateCcw } from 'lucide-react'
import type { Video, VideoMetrics } from '../../types/video'
import { fetchVideoMetrics } from '../../services/api'
import {
  DateFilterBar,
  MetricsOverviewSection,
  HourlyPeakSection,
  RetentionFunnelSection,
} from './metrics'

interface VideoMetricsTabProps {
  video: Video
  showToast: (msg: string) => void
}

type MetricsSubTab = 'overview' | 'hourly' | 'retention'

export const VideoMetricsTab: React.FC<VideoMetricsTabProps> = ({ video, showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<MetricsSubTab>('overview')
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros de Data
  const [period, setPeriod] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const loadMetrics = useCallback(async (currentPeriod = period, start = startDate, end = endDate) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchVideoMetrics(video.id, {
        period: currentPeriod,
        start_date: currentPeriod === 'custom' ? start : undefined,
        end_date: currentPeriod === 'custom' ? end : undefined,
      })
      setMetrics(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar métricas.')
      showToast('Erro ao carregar métricas do vídeo.')
    } finally {
      setLoading(false)
    }
  }, [video.id, period, startDate, endDate, showToast])

  useEffect(() => {
    if (period !== 'custom') {
      loadMetrics(period)
    }
  }, [period, loadMetrics])

  const handleApplyCustomDates = () => {
    if (!startDate && !endDate) {
      showToast('Selecione pelo menos uma data para o filtro.')
      return
    }
    loadMetrics('custom', startDate, endDate)
  }

  const subTabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3, testId: 'metrics-subtab-overview' },
    { id: 'hourly' as const, label: 'Horários de Pico (24h)', icon: Clock, testId: 'metrics-subtab-hourly' },
    { id: 'retention' as const, label: 'Funil & Retenção', icon: Filter, testId: 'metrics-subtab-retention' },
  ]

  return (
    <div style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Cabeçalho da Aba de Métricas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="#4f46e5" />
            Performance e Telemetria
          </h3>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Dados analíticos em tempo real coletados pelo player em suas páginas de vendas.
          </span>
        </div>

        <button
          type="button"
          onClick={() => loadMetrics()}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <RotateCcw size={15} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Atualizando...' : 'Recarregar'}</span>
        </button>
      </div>

      {/* Barra de Filtros por Período / Data */}
      <DateFilterBar
        period={period}
        setPeriod={setPeriod}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onApplyCustom={handleApplyCustomDates}
        loading={loading}
      />

      {/* Barra de Sub-Abas de Métricas */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          background: '#f1f5f9',
          padding: '0.35rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}
      >
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={tab.testId}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#4f46e5' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#4f46e5' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div style={{ padding: '0.85rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {loading && !metrics ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
          Carregando indicadores analíticos...
        </div>
      ) : metrics ? (
        <>
          {/* Sub-Aba 1: Visão Geral */}
          <div style={{ display: activeSubTab === 'overview' ? 'block' : 'none' }}>
            <MetricsOverviewSection metrics={metrics} />
          </div>

          {/* Sub-Aba 2: Horários & Pico (Gráfico VTurb) */}
          <div style={{ display: activeSubTab === 'hourly' ? 'block' : 'none' }}>
            <HourlyPeakSection metrics={metrics} />
          </div>

          {/* Sub-Aba 3: Funil & Retenção */}
          <div style={{ display: activeSubTab === 'retention' ? 'block' : 'none' }}>
            <RetentionFunnelSection metrics={metrics} />
          </div>
        </>
      ) : null}
    </div>
  )
}
