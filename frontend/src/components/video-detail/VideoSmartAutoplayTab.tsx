import React, { useState } from 'react'
import { VolumeX, Volume2, Sparkles, Check, Play } from 'lucide-react'
import type { Video, SmartAutoplaySettings, SmartAutoplaySize } from '../../types/video'
import { updateVideo, getMediaUrl } from '../../services/api'
import { SmartAutoplayOverlay } from '../SmartAutoplayOverlay'

interface VideoSmartAutoplayTabProps {
  video: Video
  onSave: (updated: Video) => void
  showToast: (msg: string) => void
}

export const VideoSmartAutoplayTab: React.FC<VideoSmartAutoplayTabProps> = ({
  video,
  onSave,
  showToast,
}) => {
  const current = video.player_settings?.smart_autoplay || {
    enabled: false,
    text: 'Seu vídeo já começou!',
    subtext: 'Clique no botão abaixo para ativar o som',
    button_color: '#ef4444',
    button_text: 'CLIQUE PARA OUVIR',
    restart_on_unmute: false,
    size: 'medium',
  }

  const [enabled, setEnabled] = useState(Boolean(current.enabled))
  const [size, setSize] = useState<SmartAutoplaySize>(current.size || 'medium')
  const [text, setText] = useState(current.text || 'Seu vídeo já começou!')
  const [subtext, setSubtext] = useState(current.subtext || 'Clique no botão abaixo para ativar o som')
  const [buttonColor, setButtonColor] = useState(current.button_color || '#ef4444')
  const [buttonText, setButtonText] = useState(current.button_text || 'CLIQUE PARA OUVIR')
  const [restartOnUnmute, setRestartOnUnmute] = useState(Boolean(current.restart_on_unmute))
  const [saving, setSaving] = useState(false)

  const handleToggle = async (newVal: boolean) => {
    setEnabled(newVal)
    if (!newVal) {
      try {
        setSaving(true)
        const smartAutoplayData: SmartAutoplaySettings = {
          enabled: false,
          text,
          subtext,
          button_color: buttonColor,
          button_text: buttonText,
          restart_on_unmute: restartOnUnmute,
          size,
        }
        const updatedSettings = {
          ...video.player_settings,
          smart_autoplay: smartAutoplayData,
        }
        const updated = await updateVideo(video.id, { player_settings: updatedSettings })
        onSave(updated)
        showToast('Smart Autoplay desativado com sucesso!')
      } catch {
        showToast('Erro ao desativar Smart Autoplay.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const smartAutoplayData: SmartAutoplaySettings = {
        enabled,
        text,
        subtext,
        button_color: buttonColor,
        button_text: buttonText,
        restart_on_unmute: restartOnUnmute,
        size,
      }

      const updatedSettings = {
        ...video.player_settings,
        smart_autoplay: smartAutoplayData,
      }

      const updated = await updateVideo(video.id, { player_settings: updatedSettings })
      onSave(updated)
      showToast(
        enabled
          ? 'Smart Autoplay ativado e salvo com sucesso!'
          : 'Smart Autoplay desativado com sucesso!'
      )
    } catch {
      showToast('Erro ao salvar configurações do Smart Autoplay.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="smart-autoplay-tab" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Banner Principal de Ativação / Switch */}
      <div
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))'
            : '#ffffff',
          border: enabled ? '1px solid #fca5a5' : '1px solid #e2e8f0',
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
              background: enabled ? '#fee2e2' : '#f1f5f9',
              color: enabled ? '#ef4444' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VolumeX size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b' }}>
              Smart Autoplay™
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Inicia o vídeo automaticamente sem som e exibe uma chamada animada para desmutar.
            </p>
          </div>
        </div>

        {/* Switch Ativar / Desativar */}
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
            data-testid="smart-autoplay-toggle"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: enabled ? '#ef4444' : '#cbd5e1',
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

      {/* Formulário de Configuração & Prévia (Visível EXCLUSIVAMENTE quando Ativado) */}
      {enabled && (
        <div
          data-testid="smart-autoplay-form-container"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Coluna da Esquerda: Configurações */}
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
                    onClick={() => setSize(opt.id as SmartAutoplaySize)}
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
                onChange={(e) => setText(e.target.value)}
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
                onChange={(e) => setSubtext(e.target.value)}
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
                onChange={(e) => setButtonText(e.target.value)}
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
                  onChange={(e) => setButtonColor(e.target.value)}
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
                onChange={(e) => setRestartOnUnmute(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="restart-checkbox" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                Reiniciar vídeo do início ao clicar para ouvir
              </label>
            </div>
          </div>

          {/* Coluna da Direita: Prévia ao Vivo */}
          <div>
            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
              Prévia Visual do Player
            </h4>

            <div
              data-testid="smart-autoplay-preview-box"
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '270px',
                aspectRatio: '16/9',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {video.thumbnail_url ? (
                <img
                  src={getMediaUrl(video.thumbnail_url)}
                  alt={video.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: enabled ? 0.35 : 0.9 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b' }} />
              )}

              {enabled ? (
                <SmartAutoplayOverlay
                  settings={{
                    enabled: true,
                    text,
                    subtext,
                    button_color: buttonColor,
                    button_text: buttonText,
                    restart_on_unmute: restartOnUnmute,
                    size,
                  }}
                  onUnmute={() => {}}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                  }}
                >
                  Smart Autoplay Desativado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            data-testid="smart-autoplay-save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
              transition: 'background-color 0.15s ease',
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
