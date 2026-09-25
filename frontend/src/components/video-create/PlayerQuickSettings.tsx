import React from 'react'

interface PlayerQuickSettingsProps {
  primaryColor: string
  setPrimaryColor: (color: string) => void
  autoplay: boolean
  setAutoplay: (autoplay: boolean) => void
}

export const PlayerQuickSettings: React.FC<PlayerQuickSettingsProps> = ({
  primaryColor,
  setPrimaryColor,
  autoplay,
  setAutoplay,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        background: '#f8fafc',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '2.5rem',
        border: '1px solid #f1f5f9',
      }}
    >
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.35rem',
          }}
        >
          Cor Primária do Player
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input
            type="color"
            data-testid="create-video-color-picker"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{primaryColor}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingTop: '1rem' }}>
        <input
          type="checkbox"
          id="create-autoplay-checkbox"
          data-testid="create-video-autoplay-checkbox"
          checked={autoplay}
          onChange={(e) => setAutoplay(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444' }}
        />
        <label
          htmlFor="create-autoplay-checkbox"
          style={{ fontSize: '0.85rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}
        >
          Autoplay inicial ligado
        </label>
      </div>
    </div>
  )
}
