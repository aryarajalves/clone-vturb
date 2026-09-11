import React, { useState } from 'react'
import { Calendar, Filter, Check } from 'lucide-react'

interface DateFilterBarProps {
  period: string
  setPeriod: (val: string) => void
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  onApplyCustom: () => void
  loading: boolean
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApplyCustom,
  loading,
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(period === 'custom')

  const filterOptions = [
    { id: 'today', label: 'Hoje' },
    { id: 'yesterday', label: 'Ontem' },
    { id: '7d', label: '7 Dias (1 Sem)' },
    { id: '30d', label: '30 Dias (1 Mês)' },
    { id: '1y', label: '1 Ano' },
    { id: 'all', label: 'Todo o Período' },
    { id: 'custom', label: 'Personalizado' },
  ]

  const handleSelectPeriod = (id: string) => {
    if (id === 'custom') {
      setShowCustomInputs(true)
      setPeriod('custom')
    } else {
      setShowCustomInputs(false)
      setPeriod(id)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600, flexWrap: 'wrap' }}>
          <Calendar size={16} color="#4f46e5" />
          <span>Filtrar por Período:</span>
          <span
            data-testid="brasilia-timezone-tag"
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#475569',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            🇧🇷 Fuso: Horário de Brasília (BRT / UTC-3)
          </span>
        </div>

        {/* Botões rápidos de filtro */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {filterOptions.map((opt) => {
            const isSelected = period === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`filter-btn-${opt.id}`}
                onClick={() => handleSelectPeriod(opt.id)}
                disabled={loading}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '7px',
                  border: isSelected ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                  background: isSelected ? '#eef2ff' : '#f8fafc',
                  color: isSelected ? '#4338ca' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {isSelected && <Check size={13} color="#4338ca" />}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Seletores de Data Personalizada */}
      {showCustomInputs && (
        <div
          data-testid="custom-date-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #e2e8f0',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>De:</label>
            <input
              type="date"
              data-testid="filter-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Até:</label>
            <input
              type="date"
              data-testid="filter-end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>

          <button
            type="button"
            data-testid="filter-apply-custom-btn"
            onClick={onApplyCustom}
            disabled={loading}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Filter size={13} />
            <span>Aplicar Intervalo</span>
          </button>
        </div>
      )}
    </div>
  )
}
