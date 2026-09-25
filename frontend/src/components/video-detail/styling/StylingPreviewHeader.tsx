import React from 'react'
import { Sparkles, Monitor, Smartphone } from 'lucide-react'

interface StylingPreviewHeaderProps {
  aspectRatio?: '16:9' | '9:16'
  onAspectRatioChange?: (val: '16:9' | '9:16') => void
}

export const StylingPreviewHeader: React.FC<StylingPreviewHeaderProps> = ({
  aspectRatio = '16:9',
  onAspectRatioChange,
}) => {
  return (
    <div
      style={{
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={18} color="#4f46e5" />
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
          Prévia Visual em Tempo Real
        </h3>
      </div>

      {/* Alternador Rápido de Proporção (16:9 Desktop vs 9:16 Celular) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          type="button"
          data-testid="preview-toggle-16-9"
          onClick={() => onAspectRatioChange?.('16:9')}
          style={{
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: aspectRatio === '16:9' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
            background: aspectRatio === '16:9' ? '#eef2ff' : '#ffffff',
            color: aspectRatio === '16:9' ? '#4338ca' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          <Monitor size={14} />
          <span>16:9</span>
        </button>
        <button
          type="button"
          data-testid="preview-toggle-9-16"
          onClick={() => onAspectRatioChange?.('9:16')}
          style={{
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: aspectRatio === '9:16' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
            background: aspectRatio === '9:16' ? '#eef2ff' : '#ffffff',
            color: aspectRatio === '9:16' ? '#4338ca' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          <Smartphone size={14} />
          <span>9:16 Celular</span>
        </button>
      </div>
    </div>
  )
}
