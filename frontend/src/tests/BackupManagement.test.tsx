import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BackupManagementView } from '../components/backup/BackupManagementView'
import { Sidebar } from '../components/Sidebar'
import * as backupApi from '../services/backupApi'
import type { BackupRecord, BackupSchedule, BackupMetrics } from '../types/backup'
import type { User } from '../types/auth'

vi.mock('../services/backupApi', () => ({
  fetchBackups: vi.fn(),
  fetchBackupMetrics: vi.fn(),
  fetchBackupSchedule: vi.fn(),
  createManualBackup: vi.fn(),
  updateBackupSchedule: vi.fn(),
  restoreBackup: vi.fn(),
  deleteBackup: vi.fn(),
  bulkDeleteBackups: vi.fn(),
  uploadExternalBackup: vi.fn(),
  getDownloadBackupUrl: vi.fn((id) => `http://localhost:8003/backups/${id}/download`),
}))

const mockBackupsList: BackupRecord[] = [
  {
    id: 'backup-1',
    filename: 'vturb_backup_20260911_manual.dump.gz',
    storage_path: 'vturb/backups/vturb_backup_20260911_manual.dump.gz',
    size_bytes: 1048576, // 1MB
    status: 'completed',
    is_external: false,
    created_at: '2026-09-11T12:00:00Z',
  },
  {
    id: 'backup-2',
    filename: 'vturb_backup_20260910_auto.dump.gz',
    storage_path: 'vturb/backups/vturb_backup_20260910_auto.dump.gz',
    size_bytes: 2097152, // 2MB
    status: 'completed',
    is_external: false,
    created_at: '2026-09-10T03:00:00Z',
  },
]

const mockMetricsData: BackupMetrics = {
  last_backup_filename: 'vturb_backup_20260911_manual.dump.gz',
  last_backup_at: '2026-09-11T12:00:00Z',
  next_backup_at: '2026-09-12T03:00:00Z',
  frequency_text: 'A cada 24 hora(s)',
  retention_limit: 30,
  total_backups: 2,
  total_size_bytes: 3145728,
}

const mockScheduleData: BackupSchedule = {
  id: 1,
  is_active: true,
  frequency: 'hours',
  interval_value: 24,
  s3_folder: 'vturb/backups/',
  retention_limit: 30,
  last_backup_at: '2026-09-11T03:00:00Z',
  next_backup_at: '2026-09-12T03:00:00Z',
  updated_at: '2026-09-11T03:00:00Z',
}

const mockSuperAdmin: User = {
  id: 'user-super-1',
  email: 'aryarajmarketing@gmail.com',
  name: 'Super Admin',
  role: 'super_admin',
  is_super_admin: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockNormalUser: User = {
  id: 'user-norm-1',
  email: 'cliente@vturb.com',
  name: 'Cliente Comum',
  role: 'user',
  is_super_admin: false,
  created_at: '2026-01-01T00:00:00Z',
}

describe('Módulo de Backup Automático', () => {
  const showToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(backupApi.fetchBackups).mockResolvedValue([...mockBackupsList])
    vi.mocked(backupApi.fetchBackupMetrics).mockResolvedValue({ ...mockMetricsData })
    vi.mocked(backupApi.fetchBackupSchedule).mockResolvedValue({ ...mockScheduleData })
  })

  it('renderiza os cards de métricas e tabela de backups no S3', async () => {
    render(<BackupManagementView showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('backup-management-title')).toHaveTextContent('Backup Automático')
    })

    expect(screen.getByTestId('metric-last-backup')).toBeInTheDocument()
    expect(screen.getByTestId('metric-next-backup')).toBeInTheDocument()
    expect(screen.getByTestId('metric-retention')).toBeInTheDocument()

    expect(screen.getAllByText('vturb_backup_20260911_manual.dump.gz').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('vturb_backup_20260910_auto.dump.gz')).toBeInTheDocument()
  })

  it('permite alternar entre as 3 abas e salva preferência no localStorage', async () => {
    render(<BackupManagementView showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('tab-backup-schedule')).toBeInTheDocument()
    })

    // Alterna para aba Agendamento Automático
    fireEvent.click(screen.getByTestId('tab-backup-schedule'))
    expect(screen.getByTestId('backup-schedule-tab')).toBeInTheDocument()
    expect(localStorage.getItem('vturb_backup_active_subtab')).toBe('schedule')

    // Alterna para aba Importar Backup Externo
    fireEvent.click(screen.getByTestId('tab-backup-import'))
    expect(screen.getByTestId('backup-import-tab')).toBeInTheDocument()
    expect(localStorage.getItem('vturb_backup_active_subtab')).toBe('import')

    // Retorna para aba S3
    fireEvent.click(screen.getByTestId('tab-backups-s3'))
    expect(screen.getByTestId('backups-s3-tab')).toBeInTheDocument()
    expect(localStorage.getItem('vturb_backup_active_subtab')).toBe('s3')
  })

  it('executa backup manual com sucesso ao clicar no botão "Fazer Backup Agora"', async () => {
    const createdBackup: BackupRecord = {
      id: 'backup-3',
      filename: 'vturb_backup_manual_instant.dump.gz',
      storage_path: 'vturb/backups/vturb_backup_manual_instant.dump.gz',
      size_bytes: 1500000,
      status: 'completed',
      is_external: false,
      created_at: new Date().toISOString(),
    }
    vi.mocked(backupApi.createManualBackup).mockResolvedValue(createdBackup)

    render(<BackupManagementView showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('btn-create-manual-backup')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('btn-create-manual-backup'))

    await waitFor(() => {
      expect(backupApi.createManualBackup).toHaveBeenCalledTimes(1)
      expect(showToast).toHaveBeenCalledWith(
        expect.stringContaining('Backup "vturb_backup_manual_instant.dump.gz" gerado')
      )
    })
  })

  it('atualiza as configurações de agendamento automático', async () => {
    vi.mocked(backupApi.updateBackupSchedule).mockResolvedValue({
      ...mockScheduleData,
      interval_value: 12,
      retention_limit: 45,
    })

    render(<BackupManagementView showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('tab-backup-schedule')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('tab-backup-schedule'))

    const freqSelect = screen.getByTestId('input-frequency-hours')
    fireEvent.change(freqSelect, { target: { value: '12' } })

    const retentionInput = screen.getByTestId('input-max-retention')
    fireEvent.change(retentionInput, { target: { value: '45' } })

    const saveBtn = screen.getByTestId('btn-save-schedule')
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(backupApi.updateBackupSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          interval_value: 12,
          retention_limit: 45,
        })
      )
      expect(showToast).toHaveBeenCalledWith('Configurações de agendamento de backup salvas com sucesso!')
    })
  })

  it('exibe modal de confirmação de restauração de banco ao clicar no botão restaurar', async () => {
    vi.mocked(backupApi.restoreBackup).mockResolvedValue({
      message: 'Banco restaurado com sucesso!',
      backup: mockBackupsList[0],
    })

    render(<BackupManagementView showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('btn-restore-backup-1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('btn-restore-backup-1'))

    expect(screen.getByTestId('restore-confirm-modal')).toBeInTheDocument()
    expect(screen.getByText('Restaurar Banco de Dados?')).toBeInTheDocument()

    const confirmBtn = screen.getByTestId('btn-confirm-restore')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(backupApi.restoreBackup).toHaveBeenCalledWith('backup-1')
      expect(showToast).toHaveBeenCalledWith('Banco restaurado com sucesso!')
    })
  })

  it('exibe modal de exclusão e realiza exclusão individual e em lote', async () => {
    vi.mocked(backupApi.deleteBackup).mockResolvedValue({ message: 'Backup excluído' })
    vi.mocked(backupApi.bulkDeleteBackups).mockResolvedValue({ deleted_count: 2, deleted_ids: ['backup-1', 'backup-2'] })

    render(<BackupManagementView showToast={showToast} />)

    await waitFor(() => {
      expect(screen.getByTestId('btn-delete-backup-1')).toBeInTheDocument()
    })

    // Exclusão individual
    fireEvent.click(screen.getByTestId('btn-delete-backup-1'))
    const confirmDeleteBtn = screen.getByTestId('delete-modal-confirm')
    fireEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(backupApi.deleteBackup).toHaveBeenCalledWith('backup-1')
      expect(showToast).toHaveBeenCalledWith('Backup "vturb_backup_20260911_manual.dump.gz" excluído com sucesso!')
    })

    // Seleção em lote
    const selectAllBtn = screen.getByTestId('btn-select-all-backups')
    fireEvent.click(selectAllBtn)

    const bulkDeleteBtn = screen.getByTestId('btn-bulk-delete-backups')
    expect(bulkDeleteBtn).toBeInTheDocument()
    fireEvent.click(bulkDeleteBtn)

    const confirmBulkBtn = screen.getByTestId('delete-modal-confirm')
    fireEvent.click(confirmBulkBtn)

    await waitFor(() => {
      expect(backupApi.bulkDeleteBackups).toHaveBeenCalledWith(['backup-1', 'backup-2'])
    })
  })

  it('no Sidebar, botão "Backup Automático" só aparece para Super Admin e fica acima de "Gestão de Usuário"', () => {
    const onSelectTab = vi.fn()

    // 1. Render para usuário comum: não deve renderizar botões restritos
    const { rerender } = render(
      <Sidebar currentTab="videos" onSelectTab={onSelectTab} user={mockNormalUser} />
    )
    expect(screen.queryByTestId('nav-backup-automatico')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nav-gestao-usuarios')).not.toBeInTheDocument()

    // 2. Render para Super Admin: deve renderizar ambos e na ordem correta
    rerender(<Sidebar currentTab="videos" onSelectTab={onSelectTab} user={mockSuperAdmin} />)
    const backupBtn = screen.getByTestId('nav-backup-automatico')
    const userBtn = screen.getByTestId('nav-gestao-usuarios')

    expect(backupBtn).toBeInTheDocument()
    expect(userBtn).toBeInTheDocument()

    // Validação da ordem DOM: Backup Automático acima de Gestão de Usuário
    expect(backupBtn.compareDocumentPosition(userBtn)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    // Clique no botão
    fireEvent.click(backupBtn)
    expect(onSelectTab).toHaveBeenCalledWith('backups')
  })
})
