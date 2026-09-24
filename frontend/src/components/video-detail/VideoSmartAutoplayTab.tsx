import React, { useState } from 'react'
import { VolumeX, Volume2, Sparkles, Check, Play } from 'lucide-react'
import type { Video, SmartAutoplaySettings, SmartAutoplaySize } from '../../types/video'
import { updateVideo, getMediaUrl } from '../../services/api'
import { SmartAutoplayOverlay } from '../SmartAutoplayOverlay'
import { SmartAutoplayCallForm } from './SmartAutoplayCallForm'
import { DirectAutoplayForm } from './DirectAutoplayForm'
import { DirectUnmuteBanner } from '../DirectUnmuteBanner'

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
    mode: 'smart',
    text: 'Seu vídeo já começou!',
    subtext: 'Clique no botão abaixo para ativar o som',
    button_color: '#ef4444',
    button_text: 'CLIQUE PARA OUVIR',
    restart_on_unmute: false,
    size: 'medium',
  }

  const [enabled, setEnabled] = useState(Boolean(current.enabled))
  const [mode, setMode] = useState<'smart' | 'direct'>(current.mode || 'smart')
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
          mode,
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
        mode,
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
          ? mode === 'direct'
            ? 'Autoplay Direto com som ativado e salvo com sucesso!'
            : 'Smart Autoplay ativado e salvo com sucesso!'
          : 'Autoplay desativado com sucesso!'
      )
    } catch {
      showToast('Erro ao salvar configurações do Autoplay.')
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
            {mode === 'direct' ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b' }}>
              {mode === 'direct' ? 'Autoplay Direto com Som' : 'Smart Autoplay™'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              {mode === 'direct'
                ? 'Inicia o vídeo imediatamente com som assim que a página é carregada, sem chamada na frente.'
                : 'Inicia o vídeo automaticamente sem som e exibe uma chamada animada para desmutar.'}
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
          {/* Seletor de Modo de Autoplay */}
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              Modo de Inicialização do Vídeo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                data-testid="autoplay-mode-smart"
                onClick={() => setMode('smart')}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: mode === 'smart' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  background: mode === 'smart' ? '#fef2f2' : '#ffffff',
                  color: mode === 'smart' ? '#b91c1c' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: mode === 'smart' ? '#fee2e2' : '#f1f5f9',
                    color: mode === 'smart' ? '#ef4444' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <VolumeX size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                    Smart Autoplay™
                  </div>
                  <div style={{ fontSize: '0.8rem', color: mode === 'smart' ? '#dc2626' : '#64748b', lineHeight: 1.4 }}>
                    Inicia no mudo com chamada visual animada para o usuário clicar e desmutar.
                  </div>
                </div>
              </button>

              <button
                type="button"
                data-testid="autoplay-mode-direct"
                onClick={() => setMode('direct')}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: mode === 'direct' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  background: mode === 'direct' ? '#fef2f2' : '#ffffff',
                  color: mode === 'direct' ? '#b91c1c' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: mode === 'direct' ? '#fee2e2' : '#f1f5f9',
                    color: mode === 'direct' ? '#ef4444' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Volume2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                    Autoplay Direto com Som
                  </div>
                  <div style={{ fontSize: '0.8rem', color: mode === 'direct' ? '#dc2626' : '#64748b', lineHeight: 1.4 }}>
                    Inicia com áudio de imediato, sem overlay na frente, assim que o visitante acessa.
                  </div>
                </div>
              </button>
            </div>
          </div>
        <div style={{ display: 'grid', gridTemplateColumns: mode === 'direct' ? '1fr 1fr' : '1fr 1fr', gap: '2rem' }}>
          {/* Coluna da Esquerda: Configurações do Modo Selecionado */}
          {mode === 'direct' ? (
            <DirectAutoplayForm
              enabled={enabled}
              text={text}
              onTextChange={setText}
              buttonText={buttonText}
              onButtonTextChange={setButtonText}
              buttonColor={buttonColor}
              onButtonColorChange={setButtonColor}
            />
          ) : (
            <SmartAutoplayCallForm
              enabled={enabled}
              size={size}
              onSizeChange={setSize}
              text={text}
              onTextChange={setText}
              subtext={subtext}
              onSubtextChange={setSubtext}
              buttonText={buttonText}
              onButtonTextChange={setButtonText}
              buttonColor={buttonColor}
              onButtonColorChange={setButtonColor}
              restartOnUnmute={restartOnUnmute}
              onRestartOnUnmuteChange={setRestartOnUnmute}
            />
          )}

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
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: enabled && mode === 'smart' ? 0.35 : 0.9 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b' }} />
              )}

              {enabled ? (
                mode === 'direct' ? (
                  <div
                    data-testid="direct-autoplay-preview-badge"
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <DirectUnmuteBanner
                      buttonColor={buttonColor}
                      text={text}
                      buttonText={buttonText}
                      onUnmute={() => {}}
                    />
                  </div>
                ) : (
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
                )
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
                  Autoplay Desativado
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
