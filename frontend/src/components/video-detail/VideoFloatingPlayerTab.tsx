import React, { useState } from 'react'
import { Layers, X } from 'lucide-react'
import type { Video, FloatingPlayerSettings } from '../../types/video'
import { updateVideo } from '../../services/api'

interface VideoFloatingPlayerTabProps {
  video: Video
  onSave: (updated: Video) => void
  showToast: (msg: string) => void
}

export const VideoFloatingPlayerTab: React.FC<VideoFloatingPlayerTabProps> = ({
  video,
  onSave,
  showToast,
}) => {
  const current = video.player_settings?.floating_player || {
    enabled: false,
    position: 'bottom-right',
    width: 320,
    closeable: true,
  }

  const [enabled, setEnabled] = useState(Boolean(current.enabled))
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>(
    current.position || 'bottom-right'
  )
  const [width, setWidth] = useState(current.width || 320)
  const [closeable, setCloseable] = useState(current.closeable ?? true)
  const [saving, setSaving] = useState(false)

  const handleToggle = async (newVal: boolean) => {
    setEnabled(newVal)
    if (!newVal) {
      try {
        setSaving(true)
        const floatingData: FloatingPlayerSettings = {
          enabled: false,
          position,
          width,
          closeable,
        }
        const updatedSettings = {
          ...video.player_settings,
          floating_player: floatingData,
        }
        const updated = await updateVideo(video.id, { player_settings: updatedSettings })
        onSave(updated)
        showToast('Player Flutuante desativado com sucesso!')
      } catch {
        showToast('Erro ao desativar Player Flutuante.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const floatingData: FloatingPlayerSettings = {
        enabled,
        position,
        width,
        closeable,
      }

      const updatedSettings = {
        ...video.player_settings,
        floating_player: floatingData,
      }

      const updated = await updateVideo(video.id, { player_settings: updatedSettings })
      onSave(updated)
      showToast(
        enabled
          ? 'Player Flutuante ativado e salvo com sucesso!'
          : 'Player Flutuante desativado com sucesso!'
      )
    } catch {
      showToast('Erro ao salvar configurações do Player Flutuante.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="floating-player-tab" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Banner Principal de Ativação / Switch */}
      <div
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.05))'
            : '#ffffff',
          border: enabled ? '1px solid #93c5fd' : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: enabled ? '#dbeafe' : '#f1f5f9',
              color: enabled ? '#2563eb' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b' }}>
              Player Flutuante (Picture-in-Picture)
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Fixa o vídeo no canto da tela quando o usuário rola a página para baixo, mantendo a atenção contínua.
            </p>
          </div>
        </div>

        {/* Switch */}
        <label
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '56px',
            height: '30px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            data-testid="floating-player-toggle"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: enabled ? '#2563eb' : '#cbd5e1',
              borderRadius: '34px',
              transition: 'all 0.25s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                height: '22px',
                width: '22px',
                left: enabled ? '30px' : '4px',
                bottom: '4px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </span>
        </label>
      </div>

      {/* Opções & Prévia (Visível EXCLUSIVAMENTE quando Ativado) */}
      {enabled && (
        <div
          data-testid="floating-player-content"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }}>
          {/* Coluna Configurações */}
          <div>
            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
              Posicionamento e Comportamento
            </h4>

            {/* Posição */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Posição na Tela
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  data-testid="floating-pos-bottom-left"
                  disabled={!enabled}
                  onClick={() => setPosition('bottom-left')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: position === 'bottom-left' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: position === 'bottom-left' ? '#eff6ff' : '#ffffff',
                    color: position === 'bottom-left' ? '#1d4ed8' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: enabled ? 'pointer' : 'not-allowed',
                  }}
                >
                  Canto Inferior Esquerdo
                </button>
                <button
                  type="button"
                  data-testid="floating-pos-bottom-right"
                  disabled={!enabled}
                  onClick={() => setPosition('bottom-right')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: position === 'bottom-right' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: position === 'bottom-right' ? '#eff6ff' : '#ffffff',
                    color: position === 'bottom-right' ? '#1d4ed8' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: enabled ? 'pointer' : 'not-allowed',
                  }}
                >
                  Canto Inferior Direito
                </button>
              </div>
            </div>

            {/* Largura Slider */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Largura do Mini-Player
                </label>
                <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>
                  {width}px
                </span>
              </div>
              <input
                type="range"
                data-testid="floating-width-slider"
                disabled={!enabled}
                min={240}
                max={440}
                step={10}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
              />
            </div>

            {/* Opção Fechar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="closeable-checkbox"
                data-testid="floating-closeable-checkbox"
                disabled={!enabled}
                checked={closeable}
                onChange={(e) => setCloseable(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="closeable-checkbox" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                Exibir botão "X" para permitir que o usuário feche o mini-player
              </label>
            </div>
          </div>

          {/* Coluna Prévia */}
          <div>
            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
              Esquema de Demonstração
            </h4>
            <div
              data-testid="floating-player-preview-screen"
              style={{
                position: 'relative',
                height: '210px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {/* Linhas simulando texto da página */}
              <div style={{ width: '40%', height: '8px', background: '#cbd5e1', borderRadius: '4px' }} />
              <div style={{ width: '80%', height: '6px', background: '#e2e8f0', borderRadius: '4px' }} />
              <div style={{ width: '70%', height: '6px', background: '#e2e8f0', borderRadius: '4px' }} />
              <div style={{ width: '60%', height: '6px', background: '#e2e8f0', borderRadius: '4px' }} />

              {/* Mini Player flutuante simulado */}
              {enabled && (
                <div
                  data-testid="floating-player-mockup"
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: position === 'bottom-left' ? '12px' : 'auto',
                    right: position === 'bottom-right' ? '12px' : 'auto',
                    width: `${Math.round(width * 0.42)}px`,
                    aspectRatio: '16/9',
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                    border: '2px solid #2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {closeable && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', color: '#94a3b8' }}>
                      <X size={12} />
                    </div>
                  )}
                  Mini Player
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            data-testid="floating-player-save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
