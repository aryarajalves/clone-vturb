import React, { useRef } from 'react'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { getMediaUrl } from '../../services/api'

interface ThumbnailSourceSectionProps {
  thumbMode: 'upload' | 'url'
  setThumbMode: (mode: 'upload' | 'url') => void
  thumbnailUrl: string
  setThumbnailUrl: (url: string) => void
  thumbFileName: string | null
  thumbUploading: boolean
  onUploadFile: (file: File) => void
}

export const ThumbnailSourceSection: React.FC<ThumbnailSourceSectionProps> = ({
  thumbMode,
  setThumbMode,
  thumbnailUrl,
  setThumbnailUrl,
  thumbFileName,
  thumbUploading,
  onUploadFile,
}) => {
  const thumbInputRef = useRef<HTMLInputElement | null>(null)

  return (
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
              if (file) onUploadFile(file)
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
  )
}
