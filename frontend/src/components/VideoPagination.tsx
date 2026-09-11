import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface VideoPaginationProps {
  currentPage: number
  totalPages: number
  totalVideos: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
}

export const VideoPagination: React.FC<VideoPaginationProps> = ({
  currentPage,
  totalPages,
  totalVideos,
  startIndex,
  endIndex,
  onPageChange,
}) => {
  return (
    <div
      data-testid="pagination-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.5rem',
        backgroundColor: '#fafafa',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.875rem',
        color: '#64748b',
      }}
    >
      <div data-testid="pagination-info">
        Mostrando <strong style={{ color: '#1e293b' }}>{totalVideos === 0 ? 0 : startIndex + 1}</strong> a{' '}
        <strong style={{ color: '#1e293b' }}>{endIndex}</strong> de{' '}
        <strong style={{ color: '#1e293b' }}>{totalVideos}</strong> vídeos (máx. 20 por página)
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            data-testid="pagination-prev-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
              color: currentPage === 1 ? '#94a3b8' : '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage
            return (
              <button
                key={pageNum}
                type="button"
                data-testid={`pagination-page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 0.4rem',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                  backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
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
            data-testid="pagination-next-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
              color: currentPage === totalPages ? '#94a3b8' : '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <span>Próximo</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
