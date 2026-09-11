import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  itemName?: string
  itemCount?: number
  description?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName = '',
  itemCount,
  description,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useLockBodyScroll(isOpen)

  if (!isOpen) return null

  return (
    <div
      data-testid="delete-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()} // NÃO fecha ao clicar fora
    >
      <div
        data-testid="delete-modal-content"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 32, 45, 0.95), rgba(20, 22, 30, 0.98))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '440px',
          width: '90%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(239, 68, 68, 0.2)',
          color: '#f3f4f6',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#ef4444',
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          {title}
        </h3>

        <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
          {description ? (
            description
          ) : itemCount && itemCount > 1 ? (
            <>
              Tem certeza de que deseja excluir os <strong style={{ color: '#f87171' }}>{itemCount} vídeos selecionados</strong>? Todas as métricas de analytics vinculadas serão apagadas permanentemente.
            </>
          ) : (
            <>
              Tem certeza de que deseja excluir o vídeo <strong>"{itemName}"</strong>? Todas as métricas de analytics vinculadas serão apagadas permanentemente.
            </>
          )}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="button"
            data-testid="delete-modal-cancel"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#d1d5db',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            data-testid="delete-modal-confirm"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Excluindo...' : 'Sim, Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
