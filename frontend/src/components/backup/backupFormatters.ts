import type { BackupRecord } from '../../types/backup'

export const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const formatDate = (isoString: string): string => {
  try {
    const d = new Date(isoString)
    return d.toLocaleString('pt-BR', {
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

export const getTypeBadge = (backup: BackupRecord): { label: string; bg: string; color: string } => {
  if (backup.is_external) {
    return { label: 'Importado', bg: '#f3e8ff', color: '#9333ea' }
  }
  if (backup.filename.includes('_manual')) {
    return { label: 'Manual', bg: '#e0f2fe', color: '#0284c7' }
  }
  return { label: 'Automático', bg: '#fef3c7', color: '#d97706' }
}
