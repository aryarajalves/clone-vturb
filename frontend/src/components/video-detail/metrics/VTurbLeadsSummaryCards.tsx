import React from 'react'
import { Users, Target, Flame } from 'lucide-react'

interface VTurbLeadsSummaryCardsProps {
  totalLeads: number
  leadsReachedCta: number
  ctaPercentage: number
  avgRetention: number
}

export const VTurbLeadsSummaryCards: React.FC<VTurbLeadsSummaryCardsProps> = ({
  totalLeads,
  leadsReachedCta,
  ctaPercentage,
  avgRetention,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
          }}
        >
          <Users size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            Contatos que Deram Play
          </span>
          <strong data-testid="leads-total-count" style={{ fontSize: '1.35rem', color: '#ffffff' }}>
            {totalLeads}
          </strong>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e',
          }}
        >
          <Target size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            Chegaram na Oferta (CTA)
          </span>
          <strong data-testid="leads-cta-count" style={{ fontSize: '1.35rem', color: '#22c55e' }}>
            {leadsReachedCta} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>({ctaPercentage}%)</span>
          </strong>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
          }}
        >
          <Flame size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            Retenção Média dos Contatos
          </span>
          <strong style={{ fontSize: '1.35rem', color: '#f59e0b' }}>
            {avgRetention}%
          </strong>
        </div>
      </div>
    </div>
  )
}
