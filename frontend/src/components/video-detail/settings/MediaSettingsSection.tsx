import React from 'react'
import { Sliders, Video as VideoIcon, Image as ImageIcon, Film } from 'lucide-react'
import { getMediaUrl } from '../../../services/api'

interface MediaSettingsSectionProps {
  title: string
  setTitle: (val: string) => void
  videoUrl: string
  setVideoUrl: (val: string) => void
  thumbnailUrl: string
  setThumbnailUrl: (val: string) => void
  videoUploadMode: 'url' | 'file'
  setVideoUploadMode: (val: 'url' | 'file') => void
  thumbUploadMode: 'url' | 'file'
  setThumbUploadMode: (val: 'url' | 'file') => void
  uploadingVideo: boolean
  uploadingThumb: boolean
  handleVideoFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleThumbFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const MediaSettingsSection: React.FC<MediaSettingsSectionProps> = ({
  title,
  setTitle,
  videoUrl,
  setVideoUrl,
  thumbnailUrl,
  setThumbnailUrl,
  videoUploadMode,
  setVideoUploadMode,
  thumbUploadMode,
  setThumbUploadMode,
  uploadingVideo,
  uploadingThumb,
  handleVideoFileUpload,
  handleThumbFileUpload,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Título do Vídeo */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#4f46e5" />
          Informações Básicas
        </h3>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
          Título do Vídeo
        </label>
        <input
          type="text"
          data-testid="settings-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="ex: Minha VSL de Alta Conversão"
          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Seção 1: Vídeo com Renderização/Preview */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Film size={18} color="#4f46e5" />
            Arquivo do Vídeo (.mp4)
          </h3>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              type="button"
              data-testid="settings-video-tab-url"
              onClick={() => setVideoUploadMode('url')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: videoUploadMode === 'url' ? '#e0e7ff' : '#f8fafc',
                color: videoUploadMode === 'url' ? '#4338ca' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              URL Externa
            </button>
            <button
              type="button"
              data-testid="settings-video-tab-file"
              onClick={() => setVideoUploadMode('file')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: videoUploadMode === 'file' ? '#e0e7ff' : '#f8fafc',
                color: videoUploadMode === 'file' ? '#4338ca' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Fazer Upload
            </button>
          </div>
        </div>

        {videoUploadMode === 'url' ? (
          <input
            type="url"
            data-testid="settings-video-url-input"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="https://exemplo.com/video.mp4"
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem' }}
          />
        ) : (
          <div style={{ padding: '1rem', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', marginBottom: '1.25rem' }}>
            <input
              type="file"
              data-testid="settings-video-file-input"
              accept="video/*"
              onChange={handleVideoFileUpload}
              disabled={uploadingVideo}
              style={{ fontSize: '0.85rem' }}
            />
            {uploadingVideo && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#4f46e5' }}>Enviando...</span>}
          </div>
        )}

        {/* Renderização em Tempo Real do Vídeo */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
            Prévia do Vídeo Carregado:
          </label>
          <div
            data-testid="video-render-preview"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              aspectRatio: '16/9',
              backgroundColor: '#0a0c10',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {videoUrl ? (
              <video
                src={getMediaUrl(videoUrl)}
                controls
                playsInline
                data-testid="rendered-video-element"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <VideoIcon size={28} />
                <span>Nenhum vídeo carregado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção 2: Imagem de Capa (Thumbnail) com Renderização */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={18} color="#4f46e5" />
            Imagem de Capa (Thumbnail)
          </h3>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              type="button"
              data-testid="settings-thumb-tab-url"
              onClick={() => setThumbUploadMode('url')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: thumbUploadMode === 'url' ? '#e0e7ff' : '#f8fafc',
                color: thumbUploadMode === 'url' ? '#4338ca' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              URL Externa
            </button>
            <button
              type="button"
              data-testid="settings-thumb-tab-file"
              onClick={() => setThumbUploadMode('file')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: thumbUploadMode === 'file' ? '#e0e7ff' : '#f8fafc',
                color: thumbUploadMode === 'file' ? '#4338ca' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Fazer Upload
            </button>
          </div>
        </div>

        {thumbUploadMode === 'url' ? (
          <input
            type="url"
            data-testid="settings-thumb-url-input"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://exemplo.com/capa.jpg"
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem' }}
          />
        ) : (
          <div style={{ padding: '1rem', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', marginBottom: '1.25rem' }}>
            <input
              type="file"
              data-testid="settings-thumb-file-input"
              accept="image/*"
              onChange={handleThumbFileUpload}
              disabled={uploadingThumb}
              style={{ fontSize: '0.85rem' }}
            />
            {uploadingThumb && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#4f46e5' }}>Enviando...</span>}
          </div>
        )}

        {/* Renderização em Tempo Real da Thumbnail */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
            Renderização da Capa:
          </label>
          <div
            data-testid="thumbnail-render-preview"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '16/9',
              backgroundColor: '#1e293b',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            {thumbnailUrl ? (
              <img
                src={getMediaUrl(thumbnailUrl)}
                alt="Prévia da Capa"
                data-testid="rendered-thumbnail-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={26} />
                <span>Nenhuma capa selecionada</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
