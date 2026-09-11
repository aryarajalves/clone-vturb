import React, { useState } from 'react'
import { Code, Copy, Check, ExternalLink, Sliders, Eye } from 'lucide-react'
import type { Video } from '../../types/video'

interface VideoEmbedTabProps {
  video: Video
  showToast: (msg: string) => void
}

export const VideoEmbedTab: React.FC<VideoEmbedTabProps> = ({ video, showToast }) => {
  const [copied, setCopied] = useState(false)
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe')
  const [widthPreset, setWidthPreset] = useState<'640' | '800' | '960' | '100%' | 'custom'>('640')
  const [customWidth, setCustomWidth] = useState('640')
  const [heightPreset, setHeightPreset] = useState<'16:9' | '9:16' | '4:3' | 'custom'>('16:9')
  const [customHeight, setCustomHeight] = useState('360')

  const origin = window.location.origin
  const embedUrl = `${origin}/?embed=${video.id}`

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

  let iframeCode = ''
  let scriptCode = ''

  if (heightPreset === 'custom' && resolvedHeight) {
    iframeCode = `<div style="max-width:${resolvedWidth};width:100%;height:${resolvedHeight};margin:0 auto;position:relative;">
  <iframe src="${embedUrl}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>
</div>`
    scriptCode = `<div id="vturb-player-${video.id}" style="max-width:${resolvedWidth};width:100%;height:${resolvedHeight};margin:0 auto;position:relative;">
  <iframe src="${embedUrl}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen"></iframe>
</div>`
  } else {
    const pTop = paddingTopMap[heightPreset] || '56.25%'
    iframeCode = `<div style="max-width:${resolvedWidth};width:100%;margin:0 auto;">
  <div style="position:relative;width:100%;padding-top:${pTop};">
    <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>
  </div>
</div>`
    scriptCode = `<div id="vturb-player-${video.id}" style="max-width:${resolvedWidth};width:100%;margin:0 auto;">
  <div style="position:relative;width:100%;padding-top:${pTop};">
    <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen"></iframe>
  </div>
</div>`
  }

  const currentCode = embedType === 'iframe' ? iframeCode : scriptCode

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      setCopied(true)
      showToast('Código de incorporação copiado com sucesso!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Falha ao copiar código.')
    }
  }

  return (
    <div style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Bloco 1: Controles de Dimensões */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#10b981" />
          Dimensões do Player (Largura e Altura)
        </h3>

        {/* Seleção de Largura */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Largura Máxima (Width):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
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
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  border: widthPreset === opt.value ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: widthPreset === opt.value ? '#ecfdf5' : '#f8fafc',
                  color: widthPreset === opt.value ? '#065f46' : '#475569',
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
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  width: '120px',
                  outline: 'none',
                }}
              />
            )}
          </div>
        </div>

        {/* Seleção de Altura / Proporção */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Proporção / Altura (Aspect Ratio):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
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
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  border: heightPreset === opt.value ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: heightPreset === opt.value ? '#ecfdf5' : '#f8fafc',
                  color: heightPreset === opt.value ? '#065f46' : '#475569',
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
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  width: '110px',
                  outline: 'none',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bloco 2: Código de Incorporação */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            onClick={handleCopy}
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

      {/* Bloco 3: Preview do Embed */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={18} color="#3b82f6" />
          Prévia em Tamanho Real
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem' }}>
          Assim o player será exibido na sua página com as dimensões ({resolvedWidth} de largura máxima):
        </p>

        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '10px', overflowX: 'auto' }}>
          <div style={{ maxWidth: resolvedWidth, width: '100%', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: heightPreset === 'custom' && resolvedHeight ? undefined : (paddingTopMap[heightPreset] || '56.25%'), height: heightPreset === 'custom' && resolvedHeight ? resolvedHeight : undefined }}>
              <iframe
                src={embedUrl}
                style={{
                  position: heightPreset === 'custom' && resolvedHeight ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
                title="Preview do Player"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
