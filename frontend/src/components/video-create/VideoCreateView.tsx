import React, { useState, useRef } from 'react'
import {
  ArrowLeft,
  Video as VideoIcon,
  UploadCloud,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Play,
  X,
} from 'lucide-react'
import type { Video } from '../../types/video'
import { createVideo, uploadFile, getMediaUrl } from '../../services/api'

interface VideoCreateViewProps {
  onBack: () => void
  onSuccess: (video: Video) => void
  showToast: (msg: string) => void
}

export const VideoCreateView: React.FC<VideoCreateViewProps> = ({
  onBack,
  onSuccess,
  showToast,
}) => {
  const [title, setTitle] = useState('')
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('upload')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFileName, setVideoFileName] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  const [thumbMode, setThumbMode] = useState<'upload' | 'url'>('upload')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbFileName, setThumbFileName] = useState<string | null>(null)
  const [thumbUploading, setThumbUploading] = useState(false)

  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [autoplay, setAutoplay] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  const thumbInputRef = useRef<HTMLInputElement | null>(null)

  // Auto-preenche o título se estiver vazio a partir do nome do arquivo
  const autoFillTitleFromFile = (fileName: string) => {
    if (!title.trim()) {
      const cleanName = fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (cleanName) {
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
      }
    }
  }

  const handleVideoUpload = async (file: File) => {
    try {
      setVideoUploading(true)
      setVideoProgress(20)
      setError(null)
      autoFillTitleFromFile(file.name)

      // Simulação suave de progresso visual
      const interval = setInterval(() => {
        setVideoProgress((prev) => (prev < 90 ? prev + 15 : prev))
      }, 200)

      const res = await uploadFile(file)
      clearInterval(interval)
      setVideoProgress(100)
      setVideoUrl(res.url)
      setVideoFileName(file.name)
      showToast('Arquivo de vídeo carregado com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload do vídeo.')
      setVideoUrl('')
      setVideoFileName(null)
    } finally {
      setVideoUploading(false)
    }
  }

  const handleThumbUpload = async (file: File) => {
    try {
      setThumbUploading(true)
      setError(null)
      const res = await uploadFile(file)
      setThumbnailUrl(res.url)
      setThumbFileName(file.name)
      showToast('Capa enviada com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da capa.')
    } finally {
      setThumbUploading(false)
    }
  }

  const handleDropVideo = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingVideo(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleVideoUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Por favor, informe o título do vídeo.')
      return
    }
    if (!videoUrl.trim()) {
      setError('Por favor, selecione um arquivo de vídeo ou informe uma URL válida.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const newVideo = await createVideo({
        title: title.trim(),
        video_url: videoUrl.trim(),
        thumbnail_url: thumbnailUrl.trim() || undefined,
        player_settings: {
          primary_color: primaryColor,
          autoplay,
          show_controls: true,
          cta_enabled: false,
          cta_time: 0,
          cta_text: 'Comprar Agora',
          cta_link: 'https://checkout.com',
        },
      })
      onSuccess(newVideo)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar o vídeo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      data-testid="video-create-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Cabeçalho no padrão idêntico ao VideoDetailView */}
      <div
        data-testid="create-header"
        style={{
          height: '65px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            type="button"
            data-testid="back-to-videos-btn"
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9'
              e.currentTarget.style.color = '#0f172a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <ArrowLeft size={16} />
            VOLTAR AOS VÍDEOS
          </button>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VideoIcon size={18} />
            </div>
            <h1
              data-testid="create-view-title"
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0,
              }}
            >
              Novo Vídeo
            </h1>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Rolagem Independente */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 2rem' }}>
        <div
          style={{
            maxWidth: '850px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.4rem 0' }}>
              Subir e Configurar Novo Vídeo
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Adicione seu vídeo para gerar seu player otimizado e ter acesso a todas as configurações avançadas.
            </p>
          </div>

          {error && (
            <div
              data-testid="create-error-banner"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.85rem 1.2rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.75rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Título do Vídeo */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Nome do Vídeo *
              </label>
              <input
                type="text"
                data-testid="create-video-title-input"
                placeholder="Ex: VSL Alta Conversão - Oferta Principal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Arquivo de Vídeo */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Vídeo (MP4, WebM ou MOV) *
                </label>
                <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    data-testid="create-video-mode-upload"
                    onClick={() => setVideoMode('upload')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: videoMode === 'upload' ? '#ffffff' : 'transparent',
                      color: videoMode === 'upload' ? '#ef4444' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: videoMode === 'upload' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <UploadCloud size={14} /> Upload de Arquivo
                  </button>
                  <button
                    type="button"
                    data-testid="create-video-mode-url"
                    onClick={() => setVideoMode('url')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: videoMode === 'url' ? '#ffffff' : 'transparent',
                      color: videoMode === 'url' ? '#ef4444' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: videoMode === 'url' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Link2 size={14} /> URL Externa
                  </button>
                </div>
              </div>

              {videoMode === 'upload' ? (
                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    style={{ display: 'none' }}
                    data-testid="create-video-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleVideoUpload(file)
                    }}
                  />
                  <div
                    data-testid="create-video-dropzone"
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDraggingVideo(true)
                    }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={handleDropVideo}
                    style={{
                      border: isDraggingVideo ? '2px dashed #ef4444' : '2px dashed #cbd5e1',
                      background: isDraggingVideo ? '#fef2f2' : '#f8fafc',
                      borderRadius: '12px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {videoUploading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Loader2 size={36} color="#ef4444" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                          Enviando vídeo para o servidor... ({videoProgress}%)
                        </span>
                        <div style={{ width: '220px', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
                          <div style={{ width: `${videoProgress}%`, height: '100%', background: '#ef4444', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    ) : videoUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                          <CheckCircle2 size={26} />
                        </div>
                        <span data-testid="video-uploaded-filename" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                          {videoFileName || 'Vídeo carregado'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Clique para substituir o arquivo
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                          <VideoIcon size={26} />
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                          Clique para selecionar ou arraste o vídeo aqui
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Formatos suportados: MP4, WebM ou MOV
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  data-testid="create-video-url-input"
                  placeholder="https://exemplo.com/meu-video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            {/* Thumbnail / Imagem de Capa */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Thumbnail / Imagem de Capa (Opcional)
                </label>
                <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    data-testid="create-thumb-mode-upload"
                    onClick={() => setThumbMode('upload')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: thumbMode === 'upload' ? '#ffffff' : 'transparent',
                      color: thumbMode === 'upload' ? '#ef4444' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: thumbMode === 'upload' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Upload de Capa
                  </button>
                  <button
                    type="button"
                    data-testid="create-thumb-mode-url"
                    onClick={() => setThumbMode('url')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: thumbMode === 'url' ? '#ffffff' : 'transparent',
                      color: thumbMode === 'url' ? '#ef4444' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: thumbMode === 'url' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    URL da Imagem
                  </button>
                </div>
              </div>

              {thumbMode === 'upload' ? (
                <div>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    data-testid="create-thumb-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleThumbUpload(file)
                    }}
                  />
                  <div
                    data-testid="create-thumb-dropzone"
                    onClick={() => thumbInputRef.current?.click()}
                    style={{
                      border: '1px dashed #cbd5e1',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                    }}
                  >
                    {thumbUploading ? (
                      <Loader2 size={20} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : thumbnailUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={getMediaUrl(thumbnailUrl)}
                          alt="Capa"
                          style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                          Capa anexada ({thumbFileName || 'Imagem'})
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b' }}>
                        <ImageIcon size={20} />
                        <span style={{ fontSize: '0.875rem' }}>Clique para selecionar uma imagem de capa</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  data-testid="create-thumb-url-input"
                  placeholder="https://exemplo.com/minha-capa.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            {/* Opções Iniciais Rápidas */}
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
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
                <label htmlFor="create-autoplay-checkbox" style={{ fontSize: '0.85rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
                  Autoplay inicial ligado
                </label>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
              <button
                type="button"
                data-testid="create-video-cancel-btn"
                onClick={onBack}
                style={{
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                data-testid="create-video-submit-btn"
                disabled={submitting || videoUploading}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: submitting || videoUploading ? '#94a3b8' : '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: submitting || videoUploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Criando Vídeo...
                  </>
                ) : (
                  <>
                    <Play size={18} fill="#fff" />
                    Criar e Configurar Vídeo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
