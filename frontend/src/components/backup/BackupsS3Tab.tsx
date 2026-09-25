import React, { useState } from 'react'
import type { BackupRecord } from '../../types/backup'
import { DeleteConfirmModal } from '../DeleteConfirmModal'
import { ManualBackupHeader } from './ManualBackupHeader'
import { BackupHistoryTable } from './BackupHistoryTable'
import { RestoreBackupModal } from './RestoreBackupModal'

interface BackupsS3TabProps {
  backups: BackupRecord[]
  loading: boolean
  creatingBackup: boolean
  onCreateManualBackup: () => Promise<void>
  onRestoreBackup: (backup: BackupRecord) => Promise<void>
  onDeleteBackup: (backup: BackupRecord) => Promise<void>
  onBulkDeleteBackups: (ids: string[]) => Promise<void>
  restoreLoading: boolean
  deleteLoading: boolean
}

export const BackupsS3Tab: React.FC<BackupsS3TabProps> = ({
  backups,
  loading,
  creatingBackup,
  onCreateManualBackup,
  onRestoreBackup,
  onDeleteBackup,
  onBulkDeleteBackups,
  restoreLoading,
  deleteLoading,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Modais de confirmação
  const [backupToDelete, setBackupToDelete] = useState<BackupRecord | null>(null)
  const [backupToRestore, setBackupToRestore] = useState<BackupRecord | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Paginação
  const totalPages = Math.ceil(backups.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBackups = backups.slice(startIndex, startIndex + itemsPerPage)

  const isAllSelected =
    paginatedBackups.length > 0 &&
    paginatedBackups.every((b) => selectedIds.includes(b.id))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedBackups.some((b) => b.id === id))
      )
    } else {
      const pageIds = paginatedBackups.map((b) => b.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div data-testid="backups-s3-tab">
      {/* Card de Execução de Backup Manual */}
      <ManualBackupHeader
        creatingBackup={creatingBackup}
        onCreateManualBackup={onCreateManualBackup}
      />

      {/* Tabela de Histórico de Backups com Seleção e Paginação */}
      <BackupHistoryTable
        backups={backups}
        paginatedBackups={paginatedBackups}
        loading={loading}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        currentPage={currentPage}
        totalPages={totalPages}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelect={handleToggleSelect}
        onOpenBulkDelete={() => setShowBulkDeleteModal(true)}
        onRestoreClick={(b) => setBackupToRestore(b)}
        onDeleteClick={(b) => setBackupToDelete(b)}
        onPageChange={setCurrentPage}
      />

      {/* Modal de Exclusão Individual */}
      <DeleteConfirmModal
        isOpen={Boolean(backupToDelete)}
        title="Excluir Backup"
        itemName={backupToDelete?.filename || ''}
        description={`Tem certeza de que deseja excluir o backup "${backupToDelete?.filename}"? O arquivo do dump será removido permanentemente.`}
        loading={deleteLoading}
        onConfirm={async () => {
          if (backupToDelete) {
            await onDeleteBackup(backupToDelete)
            setBackupToDelete(null)
          }
        }}
        onCancel={() => setBackupToDelete(null)}
      />

      {/* Modal de Exclusão em Lote */}
      <DeleteConfirmModal
        isOpen={showBulkDeleteModal}
        title="Excluir Backups em Lote"
        itemCount={selectedIds.length}
        description={`Tem certeza de que deseja excluir os ${selectedIds.length} backups selecionados? Todos os arquivos de dump serão removidos permanentemente.`}
        loading={deleteLoading}
        onConfirm={async () => {
          await onBulkDeleteBackups(selectedIds)
          setSelectedIds([])
          setShowBulkDeleteModal(false)
        }}
        onCancel={() => setShowBulkDeleteModal(false)}
      />

      {/* Modal de Restauração de Backup */}
      <RestoreBackupModal
        backup={backupToRestore}
        loading={restoreLoading}
        onConfirm={async (backup) => {
          await onRestoreBackup(backup)
          setBackupToRestore(null)
        }}
        onCancel={() => setBackupToRestore(null)}
      />
    </div>
  )
}
