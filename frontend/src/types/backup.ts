export interface BackupRecord {
  id: string
  filename: string
  storage_path: string
  size_bytes: number
  status: 'completed' | 'failed' | 'in_progress' | string
  is_external: boolean
  error_message?: string | null
  created_at: string
}

export interface BackupSchedule {
  id: number
  is_active: boolean
  frequency: string
  interval_value: number
  s3_folder: string
  retention_limit: number
  last_backup_at?: string | null
  next_backup_at?: string | null
  updated_at: string
}

export interface BackupMetrics {
  last_backup_filename?: string | null
  last_backup_at?: string | null
  next_backup_at?: string | null
  frequency_text?: string | null
  retention_limit: number
  total_backups: number
  total_size_bytes?: number
  storage_configured?: boolean
  storage_message?: string | null
}

export interface UpdateSchedulePayload {
  is_active?: boolean
  frequency?: string
  interval_value?: number
  s3_folder?: string
  retention_limit?: number
}
