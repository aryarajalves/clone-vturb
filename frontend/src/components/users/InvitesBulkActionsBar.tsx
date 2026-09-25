import React from 'react'
import { CheckSquare, Square, Trash2 } from 'lucide-react'

interface InvitesBulkActionsBarProps {
  allSelected: boolean
  onToggleSelectAll: () => void
  selectedCount: number
  onBulkDelete: () => void
  totalCount: number
}

export const InvitesBulkActionsBar: React.FC<InvitesBulkActionsBarProps> = ({
  allSelected,
  onToggleSelectAll,
  selectedCount,
  onBulkDelete,
  totalCount,
}) => {
  return (
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
          data-testid="btn-select-all-invites"
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
          {allSelected ? <CheckSquare size={16} color="#0284c7" /> : <Square size={16} color="#64748b" />}
          <span>{allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
        </button>

        {selectedCount > 0 && (
          <div
            data-testid="bulk-actions-invites-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
            }}
          >
            <span
              data-testid="bulk-count-invites-text"
              style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}
            >
              {selectedCount} {selectedCount === 1 ? 'convite selecionado' : 'convites selecionados'}
            </span>
            <button
              type="button"
              data-testid="btn-bulk-delete-invites"
              onClick={onBulkDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
              }}
            >
              <Trash2 size={15} />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>

      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
        {totalCount} {totalCount === 1 ? 'convite registrado' : 'convites registrados'}
      </span>
    </div>
  )
}
