import React, { useState, useRef } from 'react'
import { UploadCloud, Link2, Loader2, CheckCircle2, Video as VideoIcon } from 'lucide-react'

interface VideoSourceSectionProps {
  videoMode: 'upload' | 'url'
  setVideoMode: (mode: 'upload' | 'url') => void
  videoUrl: string
  setVideoUrl: (url: string) => void
  videoFileName: string | null
  videoUploading: boolean
  videoProgress: number
  onUploadFile: (file: File) => void
}

export const VideoSourceSection: React.FC<VideoSourceSectionProps> = ({
  videoMode,
  setVideoMode,
  videoUrl,
  setVideoUrl,
  videoFileName,
  videoUploading,
  videoProgress,
  onUploadFile,
}) => {
  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const handleDropVideo = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingVideo(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onUploadFile(file)
    }
  }

  return (
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
              if (file) onUploadFile(file)
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
  )
}
