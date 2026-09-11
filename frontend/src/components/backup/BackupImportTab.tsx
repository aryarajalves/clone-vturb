import React, { useState, useRef } from 'react'
import { UploadCloud, FileUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface BackupImportTabProps {
  onUploadBackup: (file: File) => Promise<void>
  uploading: boolean
}

export const BackupImportTab: React.FC<BackupImportTabProps> = ({ onUploadBackup, uploading }) => {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const allowedExtensions = ['.dump', '.dump.gz', '.sql', '.gz', '.tar']

  const validateFile = (file: File): boolean => {
    const name = file.name.toLowerCase()
    const isValid = allowedExtensions.some((ext) => name.endsWith(ext))
    if (!isValid) {
      setErrorMessage(`Formato não suportado. Utilize arquivos: ${allowedExtensions.join(', ')}`)
      setSelectedFile(null)
      return false
    }
    setErrorMessage(null)
    setSelectedFile(file)
    return true
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile) return
    await onUploadBackup(selectedFile)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div data-testid="backup-import-tab" style={{ maxWidth: '780px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '2rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Importar Backup Externo
          </h3>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Envie arquivos de dump gerados fora do VTurb ou migrados de outro ambiente diretamente para o Backblaze B2.
          </p>
        </div>

        {/* Zona de Drop */}
        <div
          data-testid="dropzone-backup-import"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#0284c7' : '#cbd5e1'}`,
            borderRadius: '16px',
            backgroundColor: dragOver ? '#f0f9ff' : '#f8fafc',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1.5rem',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".dump,.gz,.sql,.tar"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <UploadCloud size={30} />
          </div>

          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem', marginBottom: '0.35rem' }}>
            Arraste e solte o arquivo de backup aqui
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            ou clique para navegar no seu computador
          </div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: '#94a3b8',
              backgroundColor: '#ffffff',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            Formatos aceitos: .dump, .dump.gz, .sql (PostgreSQL)
          </span>
        </div>

        {/* Erro de Formato */}
        {errorMessage && (
          <div
            data-testid="import-error"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              border: '1px solid #fee2e2',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Arquivo Selecionado */}
        {selectedFile && (
          <div
            data-testid="selected-file-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileUp size={20} color="#16a34a" />
              <div>
                <div style={{ fontWeight: 600, color: '#15803d', fontSize: '0.9rem' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formatBytes(selectedFile.size)}
                </div>
              </div>
            </div>

            <button
              type="button"
              data-testid="btn-upload-submit"
              disabled={uploading}
              onClick={handleUploadSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.75 : 1,
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
              }}
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{uploading ? 'Enviando ao S3...' : 'Fazer Upload'}</span>
            </button>
          </div>
        )}

        {/* Card Informativo com Recomendações */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Observações Importantes:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#64748b', lineHeight: '1.6' }}>
            <li>O arquivo será enviado e criptografado diretamente no bucket do Backblaze B2.</li>
            <li>Após o upload, o dump aparecerá imediatamente na aba "Backups no S3" com a tag <code>Importado</code>.</li>
            <li>Você poderá baixá-lo ou restaurá-lo diretamente a qualquer momento através da tabela de backups.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
