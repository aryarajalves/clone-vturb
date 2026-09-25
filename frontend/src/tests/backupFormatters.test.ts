import { describe, it, expect } from 'vitest'
import { formatBytes, formatDate, getTypeBadge } from '../components/backup/backupFormatters'
import type { BackupRecord } from '../types/backup'

describe('backupFormatters - Testes Unitários de Formatação de Backup', () => {
  it('formata bytes em unidades legíveis (B, KB, MB, GB)', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(undefined)).toBe('0 B')
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  it('formata datas em string legível no padrão pt-BR', () => {
    const formatted = formatDate('2026-09-25T14:30:00Z')
    expect(formatted).toBeTruthy()
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('identifica corretamente os badges de tipo de backup', () => {
    const manualBackup: BackupRecord = {
      id: '1',
      filename: 'backup_manual_2026.dump.gz',
      size_bytes: 1000,
      created_at: '2026-09-25T10:00:00Z',
      is_external: false,
    }
    const autoBackup: BackupRecord = {
      id: '2',
      filename: 'backup_auto_2026.dump.gz',
      size_bytes: 1000,
      created_at: '2026-09-25T10:00:00Z',
      is_external: false,
    }
    const externalBackup: BackupRecord = {
      id: '3',
      filename: 'backup_import_2026.dump.gz',
      size_bytes: 1000,
      created_at: '2026-09-25T10:00:00Z',
      is_external: true,
    }

    expect(getTypeBadge(manualBackup).label).toBe('Manual')
    expect(getTypeBadge(autoBackup).label).toBe('Automático')
    expect(getTypeBadge(externalBackup).label).toBe('Importado')
  })
})
