import React, { useState, useEffect, useCallback } from 'react'
import { HardDrive, CalendarClock, UploadCloud, RefreshCw } from 'lucide-react'
import type { BackupRecord, BackupSchedule, BackupMetrics, UpdateSchedulePayload } from '../../types/backup'
import {
  fetchBackups,
  fetchBackupMetrics,
  fetchBackupSchedule,
  createManualBackup,
  updateBackupSchedule,
  restoreBackup,
  deleteBackup,
  bulkDeleteBackups,
  uploadExternalBackup,
} from '../../services/backupApi'
import { BackupMetricsCards } from './BackupMetricsCards'
import { BackupsS3Tab } from './BackupsS3Tab'
import { BackupScheduleTab } from './BackupScheduleTab'
import { BackupImportTab } from './BackupImportTab'
import { BackupCreationModal } from './BackupCreationModal'

interface BackupManagementViewProps {
  showToast: (msg: string) => void
}

type BackupSubTab = 's3' | 'schedule' | 'import'

const BACKUP_TAB_KEY = 'vturb_backup_active_subtab'

export const BackupManagementView: React.FC<BackupManagementViewProps> = ({ showToast }) => {
  // Persistência da subaba no localStorage ao recarregar a página
  const [activeTab, setActiveTab] = useState<BackupSubTab>(() => {
    const saved = localStorage.getItem(BACKUP_TAB_KEY)
    if (saved === 's3' || saved === 'schedule' || saved === 'import') {
      return saved
    }
    return 's3'
  })

  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [metrics, setMetrics] = useState<BackupMetrics | null>(null)
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null)

  const [loading, setLoading] = useState(true)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSelectTab = (tab: BackupSubTab) => {
    setActiveTab(tab)
    localStorage.setItem(BACKUP_TAB_KEY, tab)
  }

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true)
      const [backupsData, metricsData, scheduleData] = await Promise.all([
        fetchBackups(0, 100),
        fetchBackupMetrics(),
        fetchBackupSchedule(),
      ])
      setBackups(backupsData)
      setMetrics(metricsData)
      setSchedule(scheduleData)
    } catch (err: any) {
      showToast(err?.message || 'Erro ao carregar dados de backup.')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ação: Fazer Backup Manual
  const handleCreateManualBackup = async () => {
    try {
      setCreatingBackup(true)
      const newBackup = await createManualBackup()
      showToast(`Backup "${newBackup.filename}" gerado e enviado com sucesso ao S3!`)
      await loadAllData()
    } catch (err: any) {
      showToast(err?.message || 'Erro ao gerar backup manual.')
    } finally {
      setCreatingBackup(false)
    }
  }

  // Ação: Salvar Agendamento
  const handleSaveSchedule = async (payload: UpdateSchedulePayload) => {
    try {
      setSavingSchedule(true)
      const updated = await updateBackupSchedule(payload)
      setSchedule(updated)
      showToast('Configurações de agendamento de backup salvas com sucesso!')
      await loadAllData()
    } catch (err: any) {
      showToast(err?.message || 'Erro ao salvar agendamento.')
    } finally {
      setSavingSchedule(false)
    }
  }

  // Ação: Restaurar Backup
  const handleRestoreBackup = async (backup: BackupRecord) => {
    try {
      setRestoreLoading(true)
      const res = await restoreBackup(backup.id)
      showToast(res.message || `Banco restaurado com sucesso a partir de "${backup.filename}"!`)
      await loadAllData()
    } catch (err: any) {
      showToast(err?.message || 'Erro ao restaurar o banco de dados.')
    } finally {
      setRestoreLoading(false)
    }
  }

  // Ação: Excluir Backup Individual
  const handleDeleteBackup = async (backup: BackupRecord) => {
    try {
      setDeleteLoading(true)
      await deleteBackup(backup.id)
      showToast(`Backup "${backup.filename}" excluído com sucesso!`)
      setBackups((prev) => prev.filter((b) => b.id !== backup.id))
      await loadAllData()
    } catch (err: any) {
      showToast(err?.message || 'Erro ao excluir backup.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Ação: Exclusão em Lote
  const handleBulkDeleteBackups = async (ids: string[]) => {
    try {
      setDeleteLoading(true)
      const res = await bulkDeleteBackups(ids)
      showToast(res.message || `${ids.length} backups excluídos com sucesso!`)
      setBackups((prev) => prev.filter((b) => !ids.includes(b.id)))
      await loadAllData()
    } catch (err: any) {
      showToast(err?.message || 'Erro ao excluir backups em massa.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Ação: Upload de Backup Externo
  const handleUploadBackup = async (file: File) => {
    try {
      setUploading(true)
      const uploaded = await uploadExternalBackup(file)
      showToast(`Arquivo "${uploaded.filename}" enviado com sucesso ao S3!`)
      await loadAllData()
      handleSelectTab('s3')
    } catch (err: any) {
      showToast(err?.message || 'Erro ao fazer upload do backup.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main
      data-testid="backup-management-view"
      style={{
        flex: 1,
        padding: '2rem 3rem',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Cabeçalho da Página */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            data-testid="backup-management-title"
            style={{
              fontSize: '1.65rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Backup Automático
          </h2>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Gerenciamento e sincronização dos backups do PostgreSQL com o Backblaze B2 (S3)
          </span>
        </div>

        <button
          type="button"
          data-testid="btn-refresh-backups"
          onClick={loadAllData}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Cards de Métricas Superiores */}
      <BackupMetricsCards metrics={metrics} loading={loading} />

      {/* Navegação por Abas no Design VTurb */}
      <div
        data-testid="backup-tabs"
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '2rem',
        }}
      >
        <button
          type="button"
          data-testid="tab-backups-s3"
          onClick={() => handleSelectTab('s3')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 's3' ? '2px solid #0284c7' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 's3' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 's3' ? 600 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <HardDrive size={18} />
          <span>Backups no S3</span>
        </button>

        <button
          type="button"
          data-testid="tab-backup-schedule"
          onClick={() => handleSelectTab('schedule')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'schedule' ? '2px solid #0284c7' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'schedule' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'schedule' ? 600 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <CalendarClock size={18} />
          <span>Agendamento Automático</span>
        </button>

        <button
          type="button"
          data-testid="tab-backup-import"
          onClick={() => handleSelectTab('import')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'import' ? '2px solid #0284c7' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'import' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'import' ? 600 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <UploadCloud size={18} />
          <span>Importar Backup Externo</span>
        </button>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      {activeTab === 's3' && (
        <BackupsS3Tab
          backups={backups}
          loading={loading}
          creatingBackup={creatingBackup}
          onCreateManualBackup={handleCreateManualBackup}
          onRestoreBackup={handleRestoreBackup}
          onDeleteBackup={handleDeleteBackup}
          onBulkDeleteBackups={handleBulkDeleteBackups}
          restoreLoading={restoreLoading}
          deleteLoading={deleteLoading}
        />
      )}

      {activeTab === 'schedule' && (
        <BackupScheduleTab
          schedule={schedule}
          loading={loading}
          saving={savingSchedule}
          onSaveSchedule={handleSaveSchedule}
        />
      )}

      {activeTab === 'import' && (
        <BackupImportTab onUploadBackup={handleUploadBackup} uploading={uploading} />
      )}

      {/* Popup / Modal de Feedback de Criação de Backup */}
      <BackupCreationModal isOpen={creatingBackup} />
    </main>
  )
}
