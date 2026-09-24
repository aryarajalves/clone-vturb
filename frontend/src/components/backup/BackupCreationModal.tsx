import React from 'react'
import { Database, Loader2, ShieldCheck } from 'lucide-react'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

interface BackupCreationModalProps {
  isOpen: boolean
}

export const BackupCreationModal: React.FC<BackupCreationModalProps> = ({ isOpen }) => {
  useLockBodyScroll(isOpen)

  if (!isOpen) return null

  return (
    <div
      data-testid="backup-creation-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-testid="backup-creation-modal"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone com Efeito Visual de Loading */}
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Anel Externo Giratório */}
          <div
            className="animate-spin"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '3px solid #e0f2fe',
              borderTopColor: '#0284c7',
              boxSizing: 'border-box',
            }}
          />

          {/* Círculo Central com Ícone de Banco */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
            }}
          >
            <Database size={30} color="#0284c7" />
          </div>
        </div>

        {/* Badge de Status em Andamento */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
              animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <span>Processando PostgreSQL & S3</span>
        </div>

        {/* Título Principal */}
        <h3
          data-testid="backup-creation-title"
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Criando Backup do Sistema
        </h3>

        {/* Descrição Explicativa */}
        <p
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '0.9rem',
            color: '#64748b',
            lineHeight: '1.55',
            maxWidth: '380px',
          }}
        >
          Gerando dump compactado (<code>.dump.gz</code>) do banco de dados e sincronizando com segurança no bucket Backblaze B2 (S3).
        </p>

        {/* Barra de Progresso Animada */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f1f5f9',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #0284c7 100%)',
              backgroundSize: '200% 100%',
              borderRadius: '9999px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Aviso de Segurança */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxSizing: 'border-box',
          }}
        >
          <ShieldCheck size={16} color="#0284c7" />
          <span
            style={{
              fontSize: '0.8rem',
              color: '#475569',
              fontWeight: 500,
            }}
          >
            Não feche ou recarregue a página até a conclusão.
          </span>
        </div>
      </div>
    </div>
  )
}
