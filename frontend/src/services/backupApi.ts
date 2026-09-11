import type {
  BackupRecord,
  BackupSchedule,
  BackupMetrics,
  UpdateSchedulePayload,
} from '../types/backup'
import { authHeaders } from './api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8003'

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
  return `${API_BASE}/backups/${backupId}/download`
}
