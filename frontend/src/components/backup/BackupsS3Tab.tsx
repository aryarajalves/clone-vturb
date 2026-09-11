import React, { useState } from 'react'
import {
  Download,
  RotateCcw,
  Trash2,
  Play,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import type { BackupRecord } from '../../types/backup'
import { getDownloadBackupUrl } from '../../services/backupApi'
import { DeleteConfirmModal } from '../DeleteConfirmModal'

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

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (isoString: string) => {
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

  const getTypeBadge = (backup: BackupRecord) => {
    if (backup.is_external) {
      return { label: 'Importado', bg: '#f3e8ff', color: '#9333ea' }
    }
    if (backup.filename.includes('_manual')) {
      return { label: 'Manual', bg: '#e0f2fe', color: '#0284c7' }
    }
    return { label: 'Automático', bg: '#fef3c7', color: '#d97706' }
  }

  return (
    <div data-testid="backups-s3-tab">
      {/* Card de Execução de Backup Manual */}
      <div
        data-testid="manual-backup-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Database size={20} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Execução de Backup Manual
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
            Gere imediatamente um dump compactado (<code>.dump.gz</code>) do banco de dados PostgreSQL e
            armazene com segurança criptografada no bucket do Backblaze B2 (S3).
          </p>
        </div>

        <button
          type="button"
          data-testid="btn-create-manual-backup"
          onClick={onCreateManualBackup}
          disabled={creatingBackup}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: creatingBackup ? 'not-allowed' : 'pointer',
            opacity: creatingBackup ? 0.75 : 1,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s',
          }}
        >
          {creatingBackup ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="#ffffff" />}
          <span>{creatingBackup ? 'Gerando Backup...' : 'Fazer Backup Agora'}</span>
        </button>
      </div>

      {/* Barra de Ações em Lote e Contagem */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            data-testid="btn-select-all-backups"
            onClick={handleToggleSelectAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isAllSelected ? <CheckSquare size={16} color="#0284c7" /> : <Square size={16} color="#64748b" />}
            <span>{isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              data-testid="btn-bulk-delete-backups"
              onClick={() => setShowBulkDeleteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
              }}
            >
              <Trash2 size={16} />
              <span>Excluir Selecionados ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          {backups.length} {backups.length === 1 ? 'backup registrado' : 'backups registrados'}
        </span>
      </div>

      {/* Tabela de Backups */}
      <div
        data-testid="backups-table-container"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1.25rem', width: '40px' }}></th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Arquivo
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Tamanho
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Tipo
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Criado em
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <div>Carregando lista de backups...</div>
                  </td>
                </tr>
              ) : paginatedBackups.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Nenhum backup encontrado. Clique em "Fazer Backup Agora" para criar o primeiro.
                  </td>
                </tr>
              ) : (
                paginatedBackups.map((b) => {
                  const isChecked = selectedIds.includes(b.id)
                  const badge = getTypeBadge(b)
                  return (
                    <tr
                      key={b.id}
                      data-testid={`backup-row-${b.id}`}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isChecked ? '#f0f9ff' : 'transparent',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(b.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {isChecked ? <CheckSquare size={18} color="#0284c7" /> : <Square size={18} color="#94a3b8" />}
                        </button>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Database size={16} color="#64748b" />
                          <span>{b.filename}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: '#475569', fontSize: '0.875rem' }}>
                        {formatBytes(b.size_bytes)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
                        {formatDate(b.created_at)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {/* Botão de Download */}
                          <a
                            href={getDownloadBackupUrl(b.id)}
                            download={b.filename}
                            data-testid={`btn-download-${b.id}`}
                            title="Baixar backup"
                            style={{
                              padding: '0.45rem',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#0284c7',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            <Download size={16} />
                          </a>

                          {/* Botão de Restaurar */}
                          <button
                            type="button"
                            data-testid={`btn-restore-${b.id}`}
                            onClick={() => setBackupToRestore(b)}
                            title="Restaurar banco a partir deste backup"
                            style={{
                              padding: '0.45rem',
                              borderRadius: '8px',
                              border: '1px solid #fed7aa',
                              backgroundColor: '#fff7ed',
                              color: '#ea580c',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <RotateCcw size={16} />
                          </button>

                          {/* Botão de Excluir */}
                          <button
                            type="button"
                            data-testid={`btn-delete-${b.id}`}
                            onClick={() => setBackupToDelete(b)}
                            title="Excluir este backup"
                            style={{
                              padding: '0.45rem',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fef2f2',
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginação (Máximo 20 itens) */}
        {totalPages > 1 && (
          <div
            data-testid="backups-pagination"
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Página {currentPage} de {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                data-testid="pagination-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: currentPage === 1 ? '#94a3b8' : '#334155',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                data-testid="pagination-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: currentPage === totalPages ? '#94a3b8' : '#334155',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <span>Próximo</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Exclusão Individual */}
      <DeleteConfirmModal
        isOpen={Boolean(backupToDelete)}
        title="Excluir Backup"
        itemName={backupToDelete?.filename || ''}
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
        loading={deleteLoading}
        onConfirm={async () => {
          await onBulkDeleteBackups(selectedIds)
          setSelectedIds([])
          setShowBulkDeleteModal(false)
        }}
        onCancel={() => setShowBulkDeleteModal(false)}
      />

      {/* Modal de Restauração de Backup */}
      {backupToRestore && (
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
              Você está prestes a restaurar o banco a partir de <strong>{backupToRestore.filename}</strong>.
              Todas as tabelas serão atualizadas com o conteúdo deste snapshot.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                data-testid="btn-cancel-restore"
                disabled={restoreLoading}
                onClick={() => setBackupToRestore(null)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: restoreLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                data-testid="btn-confirm-restore"
                disabled={restoreLoading}
                onClick={async () => {
                  await onRestoreBackup(backupToRestore)
                  setBackupToRestore(null)
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: restoreLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(234, 88, 12, 0.25)',
                }}
              >
                {restoreLoading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                <span>{restoreLoading ? 'Restaurando...' : 'Confirmar Restauração'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
