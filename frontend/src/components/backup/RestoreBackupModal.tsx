import React from 'react'
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'
import type { BackupRecord } from '../../types/backup'

interface RestoreBackupModalProps {
  backup: BackupRecord | null
  loading: boolean
  onConfirm: (backup: BackupRecord) => Promise<void>
  onCancel: () => void
}

export const RestoreBackupModal: React.FC<RestoreBackupModalProps> = ({
  backup,
  loading,
  onConfirm,
  onCancel,
}) => {
  if (!backup) return null

  return (
    <div
      data-testid="restore-confirm-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 11000,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ea580c' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Restaurar Banco de Dados?
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Você está prestes a restaurar o banco a partir de <strong>{backup.filename}</strong>.
          Todas as tabelas serão atualizadas com o conteúdo deste snapshot.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            data-testid="btn-cancel-restore"
            disabled={loading}
            onClick={onCancel}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            data-testid="btn-confirm-restore"
            disabled={loading}
            onClick={async () => {
              await onConfirm(backup)
            }}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(234, 88, 12, 0.25)',
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            <span>{loading ? 'Restaurando...' : 'Confirmar Restauração'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
