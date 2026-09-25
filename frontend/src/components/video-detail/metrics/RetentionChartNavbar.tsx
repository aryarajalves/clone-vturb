import React from 'react'
import { RotateCcw } from 'lucide-react'
import type { BreakdownTab } from './VTurbMetricsBreakdown'

export type ChartTab = 'retention' | 'hourly' | BreakdownTab

interface RetentionChartNavbarProps {
  tabs: { id: ChartTab; label: string }[]
  activeTab: ChartTab
  onSelectTab: (tab: ChartTab) => void
  showConversions: boolean
  onToggleConversions: () => void
}

export const RetentionChartNavbar: React.FC<RetentionChartNavbarProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  showConversions,
  onToggleConversions,
}) => {
  return (
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
              onClick={() => onSelectTab(tab.id)}
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
            onClick={onToggleConversions}
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
  )
}
