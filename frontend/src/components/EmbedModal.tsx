import React, { useState } from 'react'
import { X, Copy, Check, Code, ExternalLink, Sliders } from 'lucide-react'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import type { Video } from '../types/video'
import { generateEmbedCode } from '../utils/embedScriptGenerator'

interface EmbedModalProps {
  video: Video | null
  isOpen: boolean
  onClose: () => void
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ video, isOpen, onClose }) => {
  useLockBodyScroll(isOpen)

  const [copied, setCopied] = useState(false)
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe')
  const [widthPreset, setWidthPreset] = useState<'640' | '800' | '960' | '100%' | 'custom'>('640')
  const [customWidth, setCustomWidth] = useState('640')
  const [heightPreset, setHeightPreset] = useState<'16:9' | '9:16' | '4:3' | 'custom'>('16:9')
  const [customHeight, setCustomHeight] = useState('360')

  if (!isOpen || !video) return null

  const origin = window.location.origin
  const embedUrl = `${origin}/?embed=${video.id}`
  const previewTestUrl = `${origin}/?preview=${video.id}&ratio=${heightPreset}&width=${encodeURIComponent(resolvedWidth)}`

  // Resolução de dimensões calculadas
  const resolvedWidth =
    widthPreset === '100%'
      ? '100%'
      : widthPreset === 'custom'
      ? customWidth.trim().endsWith('%') || customWidth.trim().endsWith('px')
        ? customWidth.trim()
        : `${customWidth.trim()}px`
      : `${widthPreset}px`

  const resolvedHeight =
    heightPreset === 'custom'
      ? customHeight.trim().endsWith('px') || customHeight.trim().endsWith('vh')
        ? customHeight.trim()
        : `${customHeight.trim()}px`
      : null

  const paddingTopMap: Record<string, string> = {
    '16:9': '56.25%',
    '9:16': '177.77%',
    '4:3': '75%',
  }

  const currentCode = generateEmbedCode({
    video,
    embedUrl,
    embedType,
    resolvedWidth,
    resolvedHeight,
    heightPreset,
    paddingTopMap,
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar:', err)
    }
  }

  return (
    <div
      data-testid="embed-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-testid="embed-modal-content"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 29, 43, 0.95), rgba(16, 18, 27, 0.98))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '680px',
          width: '92%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.15)',
          color: '#f3f4f6',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Code size={22} color="#10b981" />
            Código de Incorporação (Embed)
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem', marginTop: 0 }}>
          Personalize as dimensões do player para encaixar perfeitamente no seu site ou landing page sem distorção.
        </p>

        {/* Configurações de Dimensões (Largura e Altura) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
            <Sliders size={16} /> Dimensões do Vídeo
          </div>

          {/* Seleção de Largura */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 500 }}>
              Largura Máxima (Width):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              {[
                { label: '640px (Padrão VSL)', value: '640' },
                { label: '800px (Médio)', value: '800' },
                { label: '960px (Grande)', value: '960' },
                { label: '100% (Responsivo)', value: '100%' },
                { label: 'Personalizado', value: 'custom' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-testid={`width-preset-${opt.value}`}
                  onClick={() => setWidthPreset(opt.value as any)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    border: widthPreset === opt.value ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                    background: widthPreset === opt.value ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: widthPreset === opt.value ? '#34d399' : '#d1d5db',
                  }}
                >
                  {opt.label}
                </button>
              ))}

              {widthPreset === 'custom' && (
                <input
                  type="text"
                  data-testid="embed-custom-width-input"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  placeholder="ex: 500px ou 75%"
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    background: '#0d1117',
                    color: '#f3f4f6',
                    fontSize: '0.8rem',
                    width: '110px',
                    outline: 'none',
                  }}
                />
              )}
            </div>
          </div>

          {/* Seleção de Altura / Proporção */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 500 }}>
              Proporção / Altura (Aspect Ratio):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              {[
                { label: '16:9 (Horizontal / Padrão)', value: '16:9' },
                { label: '9:16 (Vertical / Reels)', value: '9:16' },
                { label: '4:3 (Clássico)', value: '4:3' },
                { label: 'Altura Fixa (px)', value: 'custom' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-testid={`ratio-preset-${opt.value.replace(':', '-')}`}
                  onClick={() => setHeightPreset(opt.value as any)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    border: heightPreset === opt.value ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                    background: heightPreset === opt.value ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: heightPreset === opt.value ? '#34d399' : '#d1d5db',
                  }}
                >
                  {opt.label}
                </button>
              ))}

              {heightPreset === 'custom' && (
                <input
                  type="text"
                  data-testid="embed-custom-height-input"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  placeholder="ex: 400px"
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    background: '#0d1117',
                    color: '#f3f4f6',
                    fontSize: '0.8rem',
                    width: '100px',
                    outline: 'none',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Tipo de Embed */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button
            type="button"
            data-testid="embed-type-iframe"
            onClick={() => setEmbedType('iframe')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: embedType === 'iframe' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              background: embedType === 'iframe' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
              color: embedType === 'iframe' ? '#34d399' : '#9ca3af',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Iframe Responsivo
          </button>
          <button
            type="button"
            data-testid="embed-type-script"
            onClick={() => setEmbedType('script')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: embedType === 'script' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              background: embedType === 'script' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
              color: embedType === 'script' ? '#34d399' : '#9ca3af',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Widget / Script
          </button>
        </div>

        {/* Bloco de Código */}
        <div
          style={{
            background: 'rgba(10, 12, 18, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            marginBottom: '1.25rem',
          }}
        >
          <pre
            data-testid="embed-code-text"
            style={{
              margin: 0,
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.82rem',
              color: '#a7f3d0',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              paddingRight: '5rem',
              lineHeight: 1.45,
            }}
          >
            {currentCode}
          </pre>

          <button
            type="button"
            data-testid="copy-embed-btn"
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
              color: '#fff',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href={previewTestUrl}
            data-testid="embed-modal-preview-link"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir página de teste com scroll para validar player flutuante e autoplay"
            style={{
              color: '#60a5fa',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
            }}
          >
            Abrir em Nova Aba (Página de Teste) <ExternalLink size={14} />
          </a>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#d1d5db',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
