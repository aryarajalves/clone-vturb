import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface InvitesPaginationProps {
  safeCurrentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const InvitesPagination: React.FC<InvitesPaginationProps> = ({
  safeCurrentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  return (
    <div
      data-testid="invites-pagination"
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
        Página {safeCurrentPage} de {totalPages}
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          data-testid="pagination-invites-prev"
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage === 1}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: safeCurrentPage === 1 ? '#94a3b8' : '#334155',
            cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
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
          data-testid="pagination-invites-next"
          onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage === totalPages}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: safeCurrentPage === totalPages ? '#94a3b8' : '#334155',
            cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
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
  )
}
