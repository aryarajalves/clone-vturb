import React from 'react'
import { Code, Copy, Check, ExternalLink } from 'lucide-react'

interface EmbedCodeSnippetBoxProps {
  embedType: 'iframe' | 'script'
  setEmbedType: (type: 'iframe' | 'script') => void
  currentCode: string
  copied: boolean
  onCopy: () => void
  embedUrl: string
  previewTestUrl?: string
}

export const EmbedCodeSnippetBox: React.FC<EmbedCodeSnippetBoxProps> = ({
  embedType,
  setEmbedType,
  currentCode,
  copied,
  onCopy,
  embedUrl,
  previewTestUrl,
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          💡 Visualize como seus visitantes verão o vídeo em uma página real com todas as informações.
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Link Secundário: Player Isolado */}
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="embed-open-isolated-btn"
            title="Abrir apenas o player em tela cheia isolada"
            style={{
              color: '#64748b',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Ver Player Isolado <ExternalLink size={13} />
          </a>

          {/* Botão Primário: Site Completo com Vídeo no Topo */}
          <a
            href={previewTestUrl || embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="embed-open-preview-btn"
            title="Abrir página completa com vídeo no topo e todas as informações de venda"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              color: '#ffffff',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            Abrir Site Completo em Nova Aba <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
