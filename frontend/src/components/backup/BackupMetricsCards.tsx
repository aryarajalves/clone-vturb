import React from 'react'
import { Clock, Calendar, HardDrive } from 'lucide-react'
import type { BackupMetrics } from '../../types/backup'

interface BackupMetricsCardsProps {
  metrics: BackupMetrics | null
  loading?: boolean
}

export const BackupMetricsCards: React.FC<BackupMetricsCardsProps> = ({ metrics, loading }) => {
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Nenhum'
    try {
      const date = new Date(isoString)
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div
      data-testid="backup-metrics-cards"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {/* Card 1: Último Backup */}
      <div
        data-testid="metric-last-backup"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Clock size={24} />
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Último Backup
          </span>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#0f172a',
              marginTop: '0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {loading ? 'Carregando...' : formatDate(metrics?.last_backup_at)}
          </div>
          {metrics?.last_backup_filename && (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#10b981',
                fontWeight: 600,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '220px',
              }}
              title={metrics.last_backup_filename}
            >
              {metrics.last_backup_filename}
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Próximo Backup */}
      <div
        data-testid="metric-next-backup"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Calendar size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Próximo Backup
          </span>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#0f172a',
              marginTop: '0.25rem',
            }}
          >
            {loading
              ? 'Carregando...'
              : metrics?.next_backup_at
                ? formatDate(metrics.next_backup_at)
                : 'Não agendado'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {metrics?.frequency_text || 'Frequência: Diário'}
          </span>
        </div>
      </div>

      {/* Card 3: Retenção e Armazenamento */}
      <div
        data-testid="metric-retention"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HardDrive size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Retenção no S3 / B2
          </span>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#0f172a',
              marginTop: '0.25rem',
            }}
          >
            {loading
              ? 'Carregando...'
              : `${metrics?.total_backups || 0} / máx ${metrics?.retention_limit || 30}`}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {formatBytes(metrics?.total_size_bytes)} utilizados
          </span>
        </div>
      </div>
    </div>
  )
}
