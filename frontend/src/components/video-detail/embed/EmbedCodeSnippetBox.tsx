import React from 'react'
import { Code, Copy, Check, ExternalLink } from 'lucide-react'

interface EmbedCodeSnippetBoxProps {
  embedType: 'iframe' | 'script'
  setEmbedType: (type: 'iframe' | 'script') => void
  currentCode: string
  copied: boolean
  onCopy: () => void
  embedUrl: string
}

export const EmbedCodeSnippetBox: React.FC<EmbedCodeSnippetBoxProps> = ({
  embedType,
  setEmbedType,
  currentCode,
  copied,
  onCopy,
  embedUrl,
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Code size={18} color="#4f46e5" />
          Código para Inserir no Site
        </h3>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            data-testid="embed-tab-type-iframe"
            onClick={() => setEmbedType('iframe')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: embedType === 'iframe' ? '#eef2ff' : '#f8fafc',
              color: embedType === 'iframe' ? '#4338ca' : '#64748b',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Iframe Responsivo
          </button>
          <button
            type="button"
            data-testid="embed-tab-type-script"
            onClick={() => setEmbedType('script')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: embedType === 'script' ? '#eef2ff' : '#f8fafc',
              color: embedType === 'script' ? '#4338ca' : '#64748b',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Widget / Script
          </button>
        </div>
      </div>

      {/* Caixa de Código */}
      <div
        style={{
          background: '#0d1117',
          borderRadius: '10px',
          padding: '1.25rem',
          position: 'relative',
          marginBottom: '1rem',
        }}
      >
        <pre
          data-testid="embed-code-text"
          style={{
            margin: 0,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.85rem',
            color: '#a7f3d0',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            paddingRight: '6rem',
            lineHeight: 1.5,
          }}
        >
          {currentCode}
        </pre>

        <button
          type="button"
          data-testid="copy-embed-btn"
          onClick={onCopy}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            background: copied ? '#10b981' : '#334155',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      {/* Aviso de Sincronização em Tempo Real */}
      <div
        data-testid="embed-sync-notice"
        style={{
          marginBottom: '1rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#166534',
          fontSize: '0.84rem',
          lineHeight: 1.4,
        }}
      >
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚡</span>
        <div>
          <strong>Sincronização em Tempo Real:</strong> Copie e cole este código no seu site{' '}
          <strong>uma única vez</strong>. Todas as configurações extras são carregadas dinamicamente e atualizadas
          automaticamente sempre que você salvar alterações no painel!
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#4f46e5',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Abrir Player em Nova Aba <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
