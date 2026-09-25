import React from 'react'
import { Database, Loader2, Play } from 'lucide-react'

interface ManualBackupHeaderProps {
  creatingBackup: boolean
  onCreateManualBackup: () => Promise<void>
}

export const ManualBackupHeader: React.FC<ManualBackupHeaderProps> = ({
  creatingBackup,
  onCreateManualBackup,
}) => {
  return (
    <div
      data-testid="manual-backup-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}
    >
      <div style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Database size={20} color="#0284c7" />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
            Execução de Backup Manual
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
          Gere imediatamente um dump compactado (<code>.dump.gz</code>) do banco de dados PostgreSQL e armazene com
          segurança criptografada no bucket do Backblaze B2 (S3).
        </p>
      </div>

      <button
        type="button"
        data-testid="btn-create-manual-backup"
        onClick={onCreateManualBackup}
        disabled={creatingBackup}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.75rem 1.4rem',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: creatingBackup ? 'not-allowed' : 'pointer',
          opacity: creatingBackup ? 0.75 : 1,
          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
          transition: 'all 0.2s',
        }}
      >
        {creatingBackup ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="#ffffff" />}
        <span>{creatingBackup ? 'Gerando Backup...' : 'Fazer Backup Agora'}</span>
      </button>
    </div>
  )
}
