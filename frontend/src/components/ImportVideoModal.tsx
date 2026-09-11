import React, { useState } from 'react'
import { X, Sparkles, Sliders } from 'lucide-react'
import { createVideo } from '../services/api'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { UploadField } from './UploadField'
import type { Video } from '../types/video'

interface ImportVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (video: Video) => void
}

export const ImportVideoModal: React.FC<ImportVideoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  useLockBodyScroll(isOpen)

  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [autoplay, setAutoplay] = useState(false)
  const [ctaEnabled, setCtaEnabled] = useState(false)
  const [ctaTime, setCtaTime] = useState(15)
  const [ctaText, setCtaText] = useState('Quero Comprar Agora')
  const [ctaLink, setCtaLink] = useState('https://checkout.exemplo.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !videoUrl.trim()) {
      setError('Por favor, preencha o título e a URL do vídeo.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const newVideo = await createVideo({
        title,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || undefined,
        player_settings: {
          primary_color: primaryColor,
          autoplay,
          show_controls: true,
          cta_enabled: ctaEnabled,
          cta_time: ctaTime,
          cta_text: ctaText,
          cta_link: ctaLink,
        },
      })
      onSuccess(newVideo)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar vídeo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      data-testid="import-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-testid="import-modal-content"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 29, 43, 0.95), rgba(16, 18, 27, 0.98))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '540px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.2)',
          color: '#f3f4f6',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={22} color="#818cf8" />
            Importar Novo Vídeo
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.5rem' }}>
              Nome do Vídeo *
            </label>
            <input
              type="text"
              data-testid="video-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: VSL Alta Conversão - Oferta Principal"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Upload ou URL do Vídeo */}
          <UploadField
            label="Vídeo (MP4, WebM ou MOV)"
            required
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            type="video"
            value={videoUrl}
            onChange={(url) => setVideoUrl(url)}
            placeholderUrl="https://meudominio.com/videos/vsl.mp4"
            testIdPrefix="video-upload"
          />

          {/* Upload ou URL da Thumbnail / Capa */}
          <UploadField
            label="Thumbnail / Imagem de Capa (Opcional)"
            accept="image/png,image/jpeg,image/webp,image/gif"
            type="image"
            value={thumbnailUrl}
            onChange={(url) => setThumbnailUrl(url)}
            placeholderUrl="https://meudominio.com/capa.jpg"
            testIdPrefix="thumbnail-upload"
          />

          {/* Configurações do Player */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c7d2fe', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={16} /> Personalização do Player
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Cor Primária:</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '32px', height: '32px' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#d1d5db', fontFamily: 'monospace' }}>{primaryColor}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="checkbox"
                id="autoplay-check"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="autoplay-check" style={{ fontSize: '0.85rem', color: '#d1d5db', cursor: 'pointer' }}>
                Autoplay com áudio inteligente (smart play)
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: ctaEnabled ? '0.75rem' : '0' }}>
              <input
                type="checkbox"
                id="cta-check"
                checked={ctaEnabled}
                onChange={(e) => setCtaEnabled(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="cta-check" style={{ fontSize: '0.85rem', color: '#d1d5db', cursor: 'pointer' }}>
                Ativar Botão de CTA com Delay de Pitch
              </label>
            </div>

            {ctaEnabled && (
              <div style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(99, 102, 241, 0.4)' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block' }}>Tempo de Delay (segundos):</label>
                  <input
                    type="number"
                    min="0"
                    value={ctaTime}
                    onChange={(e) => setCtaTime(Number(e.target.value))}
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      width: '100px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block' }}>Texto do Botão:</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block' }}>Link de Checkout / Destino:</label>
                  <input
                    type="url"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#d1d5db',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="submit-video-btn"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              {loading ? 'Salvando Vídeo...' : 'Criar Vídeo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
