import React from 'react'
import {
  Download,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
} from 'lucide-react'
import type { BackupRecord } from '../../types/backup'
import { getDownloadBackupUrl } from '../../services/backupApi'
import { formatBytes, formatDate, getTypeBadge } from './backupFormatters'

interface BackupHistoryTableProps {
  backups: BackupRecord[]
  paginatedBackups: BackupRecord[]
  loading: boolean
  selectedIds: string[]
  isAllSelected: boolean
  currentPage: number
  totalPages: number
  onToggleSelectAll: () => void
  onToggleSelect: (id: string) => void
  onOpenBulkDelete: () => void
  onRestoreClick: (backup: BackupRecord) => void
  onDeleteClick: (backup: BackupRecord) => void
  onPageChange: (page: number) => void
}

export const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
  backups,
  paginatedBackups,
  loading,
  selectedIds,
  isAllSelected,
  currentPage,
  totalPages,
  onToggleSelectAll,
  onToggleSelect,
  onOpenBulkDelete,
  onRestoreClick,
  onDeleteClick,
  onPageChange,
}) => {
  return (
    <>
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
            onClick={onToggleSelectAll}
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
              onClick={onOpenBulkDelete}
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

      {/* Container da Tabela de Backups */}
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
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Arquivo
                </th>
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Tamanho
                </th>
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Tipo
                </th>
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Criado em
                </th>
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
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
                          onClick={() => onToggleSelect(b.id)}
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
                            onClick={() => onRestoreClick(b)}
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
                            onClick={() => onDeleteClick(b)}
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
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
    </>
  )
}
