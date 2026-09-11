import React, { useState } from 'react'
import { Target, CheckCircle2 } from 'lucide-react'
import type { Video, TrackingPixelsSettings, PixelEventConfig } from '../../types/video'
import { updateVideo } from '../../services/api'

interface VideoPixelsTabProps {
  video: Video
  onSave: (updated: Video) => void
  showToast: (msg: string) => void
}

const defaultEvents: PixelEventConfig[] = [
  { trigger: 'percent_25', event_name: 'ViewContent_25', enabled: true },
  { trigger: 'percent_50', event_name: 'ViewContent_50', enabled: true },
  { trigger: 'percent_75', event_name: 'ViewContent_75', enabled: true },
  { trigger: 'percent_100', event_name: 'ViewContent_100', enabled: true },
  { trigger: 'pitch', event_name: 'PitchReached', enabled: true },
]

export const VideoPixelsTab: React.FC<VideoPixelsTabProps> = ({
  video,
  onSave,
  showToast,
}) => {
  const current = video.player_settings?.tracking_pixels || {
    enabled: false,
    facebook_pixel_id: '',
    google_analytics_id: '',
    tiktok_pixel_id: '',
    events: defaultEvents,
  }

  const [enabled, setEnabled] = useState(Boolean(current.enabled))
  const [facebookId, setFacebookId] = useState(current.facebook_pixel_id || '')
  const [googleId, setGoogleId] = useState(current.google_analytics_id || '')
  const [tiktokId, setTiktokId] = useState(current.tiktok_pixel_id || '')
  const [events, setEvents] = useState<PixelEventConfig[]>(
    current.events && current.events.length > 0 ? current.events : defaultEvents
  )
  const [saving, setSaving] = useState(false)

  const handleToggleEvent = (trigger: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.trigger === trigger ? { ...e, enabled: !e.enabled } : e))
    )
  }

  const handleEventNameChange = (trigger: string, name: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.trigger === trigger ? { ...e, event_name: name } : e))
    )
  }

  const handleToggle = async (newVal: boolean) => {
    setEnabled(newVal)
    if (!newVal) {
      try {
        setSaving(true)
        const trackingData: TrackingPixelsSettings = {
          enabled: false,
          facebook_pixel_id: facebookId.trim(),
          google_analytics_id: googleId.trim(),
          tiktok_pixel_id: tiktokId.trim(),
          events,
        }

        const updatedSettings = {
          ...video.player_settings,
          tracking_pixels: trackingData,
        }

        const updated = await updateVideo(video.id, { player_settings: updatedSettings })
        onSave(updated)
        showToast('Disparo de pixels desativado com sucesso!')
      } catch {
        showToast('Erro ao desativar Pixels.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const trackingData: TrackingPixelsSettings = {
        enabled,
        facebook_pixel_id: facebookId.trim(),
        google_analytics_id: googleId.trim(),
        tiktok_pixel_id: tiktokId.trim(),
        events,
      }

      const updatedSettings = {
        ...video.player_settings,
        tracking_pixels: trackingData,
      }

      const updated = await updateVideo(video.id, { player_settings: updatedSettings })
      onSave(updated)
      showToast(
        enabled
          ? 'Pixels de rastreamento ativados e salvos com sucesso!'
          : 'Disparo de pixels desativado com sucesso!'
      )
    } catch {
      showToast('Erro ao salvar configurações dos Pixels.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="pixels-tab" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Banner de Ativação */}
      <div
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(4, 120, 87, 0.05))'
            : '#ffffff',
          border: enabled ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
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
              background: enabled ? '#d1fae5' : '#f1f5f9',
              color: enabled ? '#059669' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b' }}>
              Pixels & Rastreamento de Conversão
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Dispara eventos para Facebook, Google e TikTok em porcentagens específicas de vídeo assistido para remarketing.
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
            data-testid="pixels-toggle"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: enabled ? '#059669' : '#cbd5e1',
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

      {/* Formulários (Visível EXCLUSIVAMENTE quando Ativado) */}
      {enabled && (
        <div
          data-testid="pixels-content"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
          Identificadores das Plataformas de Anúncio
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Facebook Pixel ID
            </label>
            <input
              type="text"
              data-testid="pixel-facebook-input"
              disabled={!enabled}
              value={facebookId}
              onChange={(e) => setFacebookId(e.target.value)}
              placeholder="Ex: 123456789012345"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Google Tag / Ads ID
            </label>
            <input
              type="text"
              data-testid="pixel-google-input"
              disabled={!enabled}
              value={googleId}
              onChange={(e) => setGoogleId(e.target.value)}
              placeholder="Ex: AW-XXXXX ou G-XXXXX"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              TikTok Pixel ID
            </label>
            <input
              type="text"
              data-testid="pixel-tiktok-input"
              disabled={!enabled}
              value={tiktokId}
              onChange={(e) => setTiktokId(e.target.value)}
              placeholder="Ex: CXXXXX..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Tabela de Gatilhos de Porcentagem */}
        <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
          Gatilhos de Disparo por Porcentagem e Momento
        </h4>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          {events.map((evt) => {
            const triggerLabel =
              evt.trigger === 'percent_25'
                ? '25% do Vídeo'
                : evt.trigger === 'percent_50'
                ? '50% do Vídeo'
                : evt.trigger === 'percent_75'
                ? '75% do Vídeo'
                : evt.trigger === 'percent_100'
                ? '100% (Vídeo Concluído)'
                : 'Momento do Pitch'

            return (
              <div
                key={evt.trigger}
                data-testid={`pixel-trigger-row-${evt.trigger}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  background: evt.enabled && enabled ? '#ffffff' : '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    data-testid={`pixel-check-${evt.trigger}`}
                    disabled={!enabled}
                    checked={evt.enabled}
                    onChange={() => handleToggleEvent(evt.trigger)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                    {triggerLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nome do Evento:</span>
                  <input
                    type="text"
                    data-testid={`pixel-name-${evt.trigger}`}
                    disabled={!enabled || !evt.enabled}
                    value={evt.event_name}
                    onChange={(e) => handleEventNameChange(evt.trigger, e.target.value)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      width: '180px',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Botão Salvar */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            data-testid="pixels-save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
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
