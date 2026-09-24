import React from 'react'
import type { SmartAutoplaySize } from '../../types/video'

interface SmartAutoplayCallFormProps {
  enabled: boolean
  size: SmartAutoplaySize
  onSizeChange: (size: SmartAutoplaySize) => void
  text: string
  onTextChange: (text: string) => void
  subtext: string
  onSubtextChange: (subtext: string) => void
  buttonText: string
  onButtonTextChange: (btnText: string) => void
  buttonColor: string
  onButtonColorChange: (color: string) => void
  restartOnUnmute: boolean
  onRestartOnUnmuteChange: (restart: boolean) => void
}

export const SmartAutoplayCallForm: React.FC<SmartAutoplayCallFormProps> = ({
  enabled,
  size,
  onSizeChange,
  text,
  onTextChange,
  subtext,
  onSubtextChange,
  buttonText,
  onButtonTextChange,
  buttonColor,
  onButtonColorChange,
  restartOnUnmute,
  onRestartOnUnmuteChange,
}) => {
  return (
    <div>
      <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
        Personalização da Chamada
      </h4>

      {/* Seletor de Tamanho (Mini, Pequeno, Médio, Grande) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Tamanho da Chamada
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { id: 'mini', label: 'Mini', desc: 'Compacto' },
            { id: 'small', label: 'Pequeno', desc: 'Mobile/9:16' },
            { id: 'medium', label: 'Médio', desc: 'Padrão' },
            { id: 'large', label: 'Grande', desc: 'Destaque' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              data-testid={`smart-autoplay-size-${opt.id}`}
              disabled={!enabled}
              onClick={() => onSizeChange(opt.id as SmartAutoplaySize)}
              style={{
                padding: '0.55rem 0.35rem',
                borderRadius: '8px',
                border: size === opt.id ? '2px solid #ef4444' : '1px solid #cbd5e1',
                background: size === opt.id ? '#fef2f2' : '#ffffff',
                color: size === opt.id ? '#b91c1c' : '#475569',
                cursor: enabled ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.83rem' }}>{opt.label}</span>
              <span style={{ fontSize: '0.65rem', color: size === opt.id ? '#dc2626' : '#94a3b8' }}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Texto Principal
        </label>
        <input
          type="text"
          data-testid="smart-autoplay-text-input"
          disabled={!enabled}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            background: enabled ? '#ffffff' : '#f8fafc',
          }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Subtexto / Instrução
        </label>
        <input
          type="text"
          data-testid="smart-autoplay-subtext-input"
          disabled={!enabled}
          value={subtext}
          onChange={(e) => onSubtextChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            background: enabled ? '#ffffff' : '#f8fafc',
          }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Texto do Botão
        </label>
        <input
          type="text"
          data-testid="smart-autoplay-button-text-input"
          disabled={!enabled}
          value={buttonText}
          onChange={(e) => onButtonTextChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            background: enabled ? '#ffffff' : '#f8fafc',
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Cor de Destaque do Botão
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="color"
            data-testid="smart-autoplay-color-picker"
            disabled={!enabled}
            value={buttonColor}
            onChange={(e) => onButtonColorChange(e.target.value)}
            style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{buttonColor}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <input
          type="checkbox"
          id="restart-checkbox"
          data-testid="smart-autoplay-restart-checkbox"
          disabled={!enabled}
          checked={restartOnUnmute}
          onChange={(e) => onRestartOnUnmuteChange(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label htmlFor="restart-checkbox" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
          Reiniciar vídeo do início ao clicar para ouvir
        </label>
      </div>
    </div>
  )
}
