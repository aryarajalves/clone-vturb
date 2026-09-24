import React from 'react'
import { Volume2 } from 'lucide-react'

interface DirectAutoplayFormProps {
  enabled: boolean
  text: string
  onTextChange: (text: string) => void
  buttonText: string
  onButtonTextChange: (btnText: string) => void
  buttonColor: string
  onButtonColorChange: (color: string) => void
}

export const DirectAutoplayForm: React.FC<DirectAutoplayFormProps> = ({
  enabled,
  text,
  onTextChange,
  buttonText,
  onButtonTextChange,
  buttonColor,
  onButtonColorChange,
}) => {
  return (
    <div data-testid="direct-autoplay-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Volume2 size={18} color="#ef4444" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>
            Badge de Ativação do Som
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
          Personalize a mensagem e a cor do badge que aparece caso o navegador silencie o som no primeiro segundo.
        </p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Texto do Aviso
        </label>
        <input
          type="text"
          data-testid="direct-autoplay-text-input"
          disabled={!enabled}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Ex: Seu vídeo já começou!"
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            background: enabled ? '#ffffff' : '#f8fafc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Texto do Botão
        </label>
        <input
          type="text"
          data-testid="direct-autoplay-button-text-input"
          disabled={!enabled}
          value={buttonText}
          onChange={(e) => onButtonTextChange(e.target.value)}
          placeholder="Ex: OUVIR"
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            background: enabled ? '#ffffff' : '#f8fafc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Cor do Badge e Botão
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="color"
            data-testid="direct-autoplay-color-picker"
            disabled={!enabled}
            value={buttonColor}
            onChange={(e) => onButtonColorChange(e.target.value)}
            style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{buttonColor}</span>
        </div>
      </div>
    </div>
  )
}
