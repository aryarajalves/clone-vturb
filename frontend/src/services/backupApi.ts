import type {
  BackupRecord,
  BackupSchedule,
  BackupMetrics,
  UpdateSchedulePayload,
} from '../types/backup'
import { authHeaders, getAuthToken } from './api'
import { API_BASE, getApiBaseUrl } from './apiConfig'


export async function fetchBackups(skip = 0, limit = 20): Promise<BackupRecord[]> {
  const res = await fetch(`${API_BASE}/backups/?skip=${skip}&limit=${limit}`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao carregar backups.')
  }
  return res.json()
}

export async function fetchBackupMetrics(): Promise<BackupMetrics> {
  const res = await fetch(`${API_BASE}/backups/metrics`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao carregar métricas de backup.')
  }
  return res.json()
}

export async function createManualBackup(): Promise<BackupRecord> {
  const res = await fetch(`${API_BASE}/backups/create`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao criar backup manual.')
  }
  return res.json()
}

export async function fetchBackupSchedule(): Promise<BackupSchedule> {
  const res = await fetch(`${API_BASE}/backups/schedule`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao carregar agendamento de backup.')
  }
  return res.json()
}

export async function updateBackupSchedule(payload: UpdateSchedulePayload): Promise<BackupSchedule> {
  const res = await fetch(`${API_BASE}/backups/schedule`, {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao atualizar agendamento de backup.')
  }
  return res.json()
}

export async function restoreBackup(backupId: string): Promise<{ message: string; backup: BackupRecord }> {
  const res = await fetch(`${API_BASE}/backups/${backupId}/restore`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao restaurar backup.')
  }
  return res.json()
}

export async function deleteBackup(backupId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/backups/${backupId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao excluir backup.')
  }
  return res.json()
}

export async function bulkDeleteBackups(backupIds: string[]): Promise<{ message?: string; deleted_count: number; deleted_ids: string[] }> {
  const res = await fetch(`${API_BASE}/backups/bulk-delete`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids: backupIds }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao excluir backups em massa.')
  }
  return res.json()
}

export async function uploadExternalBackup(file: File): Promise<BackupRecord> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/backups/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao enviar backup externo.')
  }
  return res.json()
}

export function getDownloadBackupUrl(backupId: string): string {
  const token = getAuthToken() || ''
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${API_BASE}/backups/${backupId}/download${query}`
}

export async function downloadBackupFile(backupId: string, filename: string): Promise<void> {
  const url = getDownloadBackupUrl(backupId)
  const res = await fetch(url, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao baixar arquivo de backup.')
  }
  const blob = await res.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}
