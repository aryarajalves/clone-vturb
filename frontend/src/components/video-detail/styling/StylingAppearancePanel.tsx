import React from 'react'
import { Check, Smartphone, Monitor } from 'lucide-react'

interface StylingAppearancePanelProps {
  primaryColor: string
  setPrimaryColor: (val: string) => void
  playShape: 'circle' | 'rounded' | 'square' | 'minimal'
  setPlayShape: (val: 'circle' | 'rounded' | 'square' | 'minimal') => void
  playSize: 'small' | 'medium' | 'large'
  setPlaySize: (val: 'small' | 'medium' | 'large') => void
  aspectRatio: '16:9' | '9:16'
  setAspectRatio: (val: '16:9' | '9:16') => void
  transparentBg?: boolean
  setTransparentBg?: (val: boolean) => void
}

export const StylingAppearancePanel: React.FC<StylingAppearancePanelProps> = ({
  primaryColor,
  setPrimaryColor,
  playShape,
  setPlayShape,
  playSize,
  setPlaySize,
  aspectRatio,
  setAspectRatio,
  transparentBg,
  setTransparentBg,
}) => {
  const presetColors = [
    '#6366f1',
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
  ]

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.35rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div>
        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
          Cores & Botão Central
        </h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
          Personalize o botão de play inicial e a cor dos elementos do player.
        </p>
      </div>

      {/* Formato de Exibição / Modo Celular */}
      <div>
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
          Formato de Exibição (Modo Celular)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            type="button"
            data-testid="styling-ratio-16-9"
            onClick={() => setAspectRatio('16:9')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: aspectRatio === '16:9' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
              background: aspectRatio === '16:9' ? '#eef2ff' : '#f8fafc',
              color: aspectRatio === '16:9' ? '#4338ca' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <Monitor size={16} />
            <span>Widescreen (16:9)</span>
          </button>
          <button
            type="button"
            data-testid="styling-ratio-9-16"
            onClick={() => setAspectRatio('9:16')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: aspectRatio === '9:16' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
              background: aspectRatio === '9:16' ? '#eef2ff' : '#f8fafc',
              color: aspectRatio === '9:16' ? '#4338ca' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <Smartphone size={16} />
            <span>Vertical Celular (9:16)</span>
          </button>
        </div>
      </div>

      {/* Paleta de Cores */}
      <div>
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
          Cor de Destaque
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              data-testid={`styling-color-${color}`}
              onClick={() => setPrimaryColor(color)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: color,
                border: primaryColor === color ? '3px solid #0f172a' : '2px solid transparent',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: primaryColor === color ? 'scale(1.1)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            >
              {primaryColor === color && <Check size={15} color="#ffffff" />}
            </button>
          ))}
          <input
            type="color"
            data-testid="styling-color-picker"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{ width: '34px', height: '34px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Formato do Botão de Play */}
      <div>
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.45rem' }}>
          Formato do Botão Central
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[
            { id: 'circle', label: 'Circular Neon' },
            { id: 'rounded', label: 'Retangular Suave' },
            { id: 'square', label: 'Quadrado Moderno' },
            { id: 'minimal', label: 'Minimalista Vazado' },
          ].map((shape) => (
            <button
              key={shape.id}
              type="button"
              data-testid={`styling-shape-${shape.id}`}
              onClick={() => setPlayShape(shape.id as any)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: playShape === shape.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                background: playShape === shape.id ? '#eef2ff' : '#f8fafc',
                color: playShape === shape.id ? '#4338ca' : '#475569',
                textAlign: 'center',
              }}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tamanho do Botão de Play */}
      <div>
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.45rem' }}>
          Tamanho do Botão
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'small', label: 'Pequeno (56px)' },
            { id: 'medium', label: 'Médio (76px)' },
            { id: 'large', label: 'Grande (96px)' },
          ].map((size) => (
            <button
              key={size.id}
              type="button"
              data-testid={`styling-size-${size.id}`}
              onClick={() => setPlaySize(size.id as any)}
              style={{
                flex: 1,
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: playSize === size.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                background: playSize === size.id ? '#eef2ff' : '#f8fafc',
                color: playSize === size.id ? '#4338ca' : '#475569',
                textAlign: 'center',
              }}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
