import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface VTurbLeadsPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
}

export const VTurbLeadsPagination: React.FC<VTurbLeadsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemsPerPage = 20,
  onPageChange,
}) => {
  if (totalItems === 0) return null

  return (
    <div
      data-testid="leads-pagination-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        background: '#090d16',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.82rem',
        color: '#94a3b8',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div data-testid="pagination-leads-info">
        Mostrando <strong style={{ color: '#ffffff' }}>{totalItems === 0 ? 0 : startIndex + 1}</strong> a{' '}
        <strong style={{ color: '#ffffff' }}>{endIndex}</strong> de{' '}
        <strong style={{ color: '#ffffff' }}>{totalItems}</strong> contatos (máx. {itemsPerPage} por página)
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            data-testid="pagination-leads-prev"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: currentPage === 1 ? 'rgba(255, 255, 255, 0.03)' : '#1e293b',
              color: currentPage === 1 ? '#475569' : '#f8fafc',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.78rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={15} />
            <span>Anterior</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage
            return (
              <button
                key={pageNum}
                type="button"
                data-testid={`pagination-leads-page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 0.35rem',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? '#22c55e' : '#1e293b',
                  color: isActive ? '#000000' : '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            type="button"
            data-testid="pagination-leads-next"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.03)' : '#1e293b',
              color: currentPage === totalPages ? '#475569' : '#f8fafc',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.78rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <span>Próximo</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
