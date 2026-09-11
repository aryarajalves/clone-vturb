import React from 'react'
import { Palette, Check, Play, Sliders } from 'lucide-react'

interface PlayerCustomizationSectionProps {
  primaryColor: string
  setPrimaryColor: (val: string) => void
  autoplay: boolean
  setAutoplay: (val: boolean) => void
  showControls: boolean
  setShowControls: (val: boolean) => void
  playShape: 'circle' | 'rounded' | 'square' | 'minimal'
  setPlayShape: (val: 'circle' | 'rounded' | 'square' | 'minimal') => void
  playSize: 'small' | 'medium' | 'large'
  setPlaySize: (val: 'small' | 'medium' | 'large') => void
}

export const PlayerCustomizationSection: React.FC<PlayerCustomizationSectionProps> = ({
  primaryColor,
  setPrimaryColor,
  autoplay,
  setAutoplay,
  showControls,
  setShowControls,
  playShape,
  setPlayShape,
  playSize,
  setPlaySize,
}) => {
  const presetColors = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4']

  const getButtonRadius = () => {
    switch (playShape) {
      case 'circle': return '50%'
      case 'rounded': return '16px'
      case 'square': return '4px'
      case 'minimal': return '50%'
    }
  }

  const getPixelSize = () => {
    switch (playSize) {
      case 'small': return 56
      case 'medium': return 80
      case 'large': return 104
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Bloco 1: Formato do Botão de Play */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={18} color="#4f46e5" />
          Estilo do Botão de Play
        </h3>

        {/* Formato */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Formato do Botão
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {[
              { id: 'circle', label: 'Circular Neon' },
              { id: 'rounded', label: 'Retangular Suave' },
              { id: 'square', label: 'Quadrado Moderno' },
              { id: 'minimal', label: 'Minimalista Vazado' },
            ].map((shape) => (
              <button
                key={shape.id}
                type="button"
                data-testid={`shape-option-${shape.id}`}
                onClick={() => setPlayShape(shape.id as any)}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: playShape === shape.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: playShape === shape.id ? '#eef2ff' : '#f8fafc',
                  color: playShape === shape.id ? '#4338ca' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tamanho */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Tamanho do Botão
          </label>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {[
              { id: 'small', label: 'Pequeno (56px)' },
              { id: 'medium', label: 'Médio (80px)' },
              { id: 'large', label: 'Grande (104px)' },
            ].map((size) => (
              <button
                key={size.id}
                type="button"
                data-testid={`size-option-${size.id}`}
                onClick={() => setPlaySize(size.id as any)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: playSize === size.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: playSize === size.id ? '#eef2ff' : '#f8fafc',
                  color: playSize === size.id ? '#4338ca' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prévia ao Vivo do Botão */}
        <div style={{ background: '#0f172a', borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Prévia Visual do Botão
          </span>
          <div
            data-testid="live-play-preview"
            style={{
              width: `${getPixelSize()}px`,
              height: `${getPixelSize()}px`,
              borderRadius: getButtonRadius(),
              backgroundColor: playShape === 'minimal' ? 'rgba(0,0,0,0.5)' : primaryColor,
              border: playShape === 'minimal' ? `3px solid ${primaryColor}` : 'none',
              boxShadow: `0 0 20px ${primaryColor}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Play size={getPixelSize() * 0.4} color="#ffffff" fill="#ffffff" style={{ marginLeft: '4px' }} />
          </div>
        </div>
      </div>

      {/* Bloco 2: Paleta de Cores e Comportamento */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#4f46e5" />
          Cores & Comportamento
        </h3>

        {/* Cores */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Cor de Destaque
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                data-testid={`color-preset-${color}`}
                onClick={() => setPrimaryColor(color)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: color,
                  border: primaryColor === color ? '3px solid #0f172a' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s ease',
                  transform: primaryColor === color ? 'scale(1.1)' : 'none',
                }}
              >
                {primaryColor === color && <Check size={16} color="#fff" />}
              </button>
            ))}
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{ width: '38px', height: '38px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>{primaryColor}</span>
          </div>
        </div>

        {/* Toggles: Autoplay & Controles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
            <input
              type="checkbox"
              data-testid="settings-autoplay-check"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
            />
            <span>
              <strong>Smart Autoplay</strong> (Inicia com áudio desativado para contornar bloqueio de navegadores)
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
            <input
              type="checkbox"
              data-testid="settings-controls-check"
              checked={showControls}
              onChange={(e) => setShowControls(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
            />
            <span>
              <strong>Exibir Barra de Controles</strong> (Play, barra de progresso, volume e tela cheia)
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
