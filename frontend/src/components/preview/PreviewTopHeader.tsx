import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface PreviewTopHeaderProps {
  rawWidth: string
  rawHeight: string | null
  effectiveRatio: string
  isTransparent: boolean
}

export const PreviewTopHeader: React.FC<PreviewTopHeaderProps> = ({
  rawWidth,
  rawHeight,
  effectiveRatio,
  isTransparent,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(10, 15, 29, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <ArrowLeft size={14} /> Painel
        </a>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
          Smart VSL <span style={{ color: '#818cf8', fontWeight: 500, fontSize: '0.8rem' }}>• Ambiente de Teste</span>
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          Página de Teste Ativa
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
        <span>
          Dimensão: <strong style={{ color: '#fff' }}>{rawWidth}</strong> (
          {rawHeight ? `${rawHeight} fixa` : effectiveRatio}) {isTransparent ? '• Sem Fundo' : '• Cinema'}
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          💡 Role a página para testar o player flutuante
        </span>
      </div>
    </header>
  )
}
