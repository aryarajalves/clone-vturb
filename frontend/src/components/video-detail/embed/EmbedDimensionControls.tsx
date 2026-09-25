import React from 'react'
import { Sliders, ExternalLink } from 'lucide-react'

interface EmbedDimensionControlsProps {
  widthPreset: '360' | '640' | '800' | '960' | '100%' | 'custom'
  customWidth: string
  setCustomWidth: (w: string) => void
  onSelectWidth: (w: '360' | '640' | '800' | '960' | '100%' | 'custom') => void
  heightPreset: '16:9' | '9:16' | '4:3' | 'custom'
  customHeight: string
  setCustomHeight: (h: string) => void
  onSelectRatio: (r: '16:9' | '9:16' | '4:3' | 'custom') => void
  transparentBg: boolean
  onToggleBackground: (transparent: boolean) => void
  resolvedWidth: string
  previewTestUrl: string
}

export const EmbedDimensionControls: React.FC<EmbedDimensionControlsProps> = ({
  widthPreset,
  customWidth,
  setCustomWidth,
  onSelectWidth,
  heightPreset,
  customHeight,
  setCustomHeight,
  onSelectRatio,
  transparentBg,
  onToggleBackground,
  resolvedWidth,
  previewTestUrl,
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h3
          style={{
            margin: '0 0 1.25rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sliders size={18} color="#10b981" />
          Dimensões do Player (Largura e Altura)
        </h3>

        {/* Seleção de Largura */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Largura Máxima (Width):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {[
              { label: '360px (Celular / Reels)', value: '360' },
              { label: '640px (Padrão VSL)', value: '640' },
              { label: '800px (Médio)', value: '800' },
              { label: '960px (Grande)', value: '960' },
              { label: '100% (Responsivo)', value: '100%' },
              { label: 'Personalizado', value: 'custom' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-testid={`width-preset-${opt.value}`}
                onClick={() => onSelectWidth(opt.value as any)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  border: widthPreset === opt.value ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: widthPreset === opt.value ? '#ecfdf5' : '#f8fafc',
                  color: widthPreset === opt.value ? '#065f46' : '#475569',
                }}
              >
                {opt.label}
              </button>
            ))}

            {widthPreset === 'custom' && (
              <input
                type="text"
                data-testid="embed-custom-width-input"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder="ex: 500px ou 75%"
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  width: '120px',
                  outline: 'none',
                }}
              />
            )}
          </div>
        </div>

        {/* Seleção de Altura / Proporção */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Proporção / Altura (Aspect Ratio):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {[
              { label: '16:9 (Horizontal / Padrão)', value: '16:9' },
              { label: '9:16 (Vertical / Reels)', value: '9:16' },
              { label: '4:3 (Clássico)', value: '4:3' },
              { label: 'Altura Fixa (px)', value: 'custom' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-testid={`ratio-preset-${opt.value.replace(':', '-')}`}
                onClick={() => onSelectRatio(opt.value as any)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  border: heightPreset === opt.value ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: heightPreset === opt.value ? '#ecfdf5' : '#f8fafc',
                  color: heightPreset === opt.value ? '#065f46' : '#475569',
                }}
              >
                {opt.label}
              </button>
            ))}

            {heightPreset === 'custom' && (
              <input
                type="text"
                data-testid="embed-custom-height-input"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder="ex: 400px"
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  width: '110px',
                  outline: 'none',
                }}
              />
            )}
          </div>
        </div>

        {/* Fundo ao Redor do Vídeo (Remover Bordas Pretas) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Fundo ao Redor do Vídeo:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              data-testid="bg-preset-transparent"
              onClick={() => onToggleBackground(true)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                border: transparentBg ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: transparentBg ? '#ecfdf5' : '#f8fafc',
                color: transparentBg ? '#065f46' : '#475569',
              }}
            >
              ✨ Apenas o Vídeo (Sem Fundo Preto)
            </button>
            <button
              type="button"
              data-testid="bg-preset-black"
              onClick={() => onToggleBackground(false)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                border: !transparentBg ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: !transparentBg ? '#ecfdf5' : '#f8fafc',
                color: !transparentBg ? '#065f46' : '#475569',
              }}
            >
              🎬 Fundo Preto (Cinema)
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Dimensão configurada: <strong style={{ color: '#0f172a' }}>{resolvedWidth}</strong> ({heightPreset === 'custom' ? `${customHeight} fixa` : `proporção ${heightPreset}`})
        </span>
        <a
          href={previewTestUrl}
          data-testid="open-preview-tab-btn"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir página de teste com scroll para validar player flutuante e autoplay"
          style={{
            color: '#4f46e5',
            fontSize: '0.82rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Abrir em nova aba <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}
