import React, { useRef, useState } from 'react'
import { UploadCloud, Link2, CheckCircle2, Loader2, RefreshCw, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'
import { uploadFile } from '../services/api'

interface UploadFieldProps {
  label: string
  required?: boolean
  accept: string
  type: 'video' | 'image'
  value: string
  onChange: (url: string) => void
  placeholderUrl: string
  testIdPrefix: string
}

export const UploadField: React.FC<UploadFieldProps> = ({
  label,
  required,
  accept,
  type,
  value,
  onChange,
  placeholderUrl,
  testIdPrefix,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setUploadError(null)
      const res = await uploadFile(file)
      setUploadedFileName(file.name)
      onChange(res.url)
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar o arquivo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db' }}>
          {label} {required && '*'}
        </label>

        {/* Alternador entre Upload e URL */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px', borderRadius: '6px' }}>
          <button
            type="button"
            data-testid={`${testIdPrefix}-tab-upload`}
            onClick={() => setMode('upload')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: mode === 'upload' ? '#6366f1' : 'transparent',
              color: mode === 'upload' ? '#ffffff' : '#9ca3af',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <UploadCloud size={13} />
            Upload
          </button>
          <button
            type="button"
            data-testid={`${testIdPrefix}-tab-url`}
            onClick={() => setMode('url')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: mode === 'url' ? '#6366f1' : 'transparent',
              color: mode === 'url' ? '#ffffff' : '#9ca3af',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Link2 size={13} />
            URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            data-testid={`${testIdPrefix}-file-input`}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1.5rem',
                borderRadius: '10px',
                border: '1px dashed #6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                color: '#c7d2fe',
                fontSize: '0.9rem',
              }}
            >
              <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Enviando {type === 'video' ? 'vídeo' : 'imagem'}...
            </div>
          ) : value && uploadedFileName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                {type === 'image' && (
                  <img
                    src={value}
                    alt="Preview Capa"
                    style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>{uploadedFileName}</div>
                  <div style={{ color: '#10b981', fontSize: '0.75rem' }}>Upload realizado com sucesso</div>
                </div>
              </div>

              <button
                type="button"
                data-testid={`${testIdPrefix}-replace-btn`}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#d1d5db',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={12} />
                Trocar
              </button>
            </div>
          ) : (
            <div
              data-testid={`${testIdPrefix}-dropzone`}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem',
                }}
              >
                {type === 'video' ? <VideoIcon size={18} /> : <ImageIcon size={18} />}
              </div>
              <div style={{ color: '#e0e7ff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                Clique para selecionar {type === 'video' ? 'o vídeo do seu dispositivo' : 'uma imagem de capa'}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                {type === 'video' ? 'Formatos suportados: MP4, WebM ou MOV' : 'Formatos suportados: PNG, JPG ou WebP'}
              </div>
            </div>
          )}

          {uploadError && (
            <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>{uploadError}</div>
          )}
        </div>
      ) : (
        <input
          type="url"
          data-testid={`${testIdPrefix}-input`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderUrl}
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
      )}
    </div>
  )
}
