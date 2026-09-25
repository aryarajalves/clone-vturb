import React, { useState } from 'react'
import { Code, Copy, Check, ExternalLink, Sliders, Eye } from 'lucide-react'
import type { Video } from '../../types/video'
import { generateEmbedCode } from '../../utils/embedScriptGenerator'
import { updateVideo } from '../../services/api'

interface VideoEmbedTabProps {
  video: Video
  showToast: (msg: string) => void
  onSave?: (updatedVideo: Video) => void
}

export const VideoEmbedTab: React.FC<VideoEmbedTabProps> = ({ video, showToast, onSave }) => {
  const [copied, setCopied] = useState(false)
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe')
  const [widthPreset, setWidthPreset] = useState<'360' | '640' | '800' | '960' | '100%' | 'custom'>('640')
  const [customWidth, setCustomWidth] = useState('640')
  const [heightPreset, setHeightPreset] = useState<'16:9' | '9:16' | '4:3' | 'custom'>(() => {
    return (video.player_settings?.aspect_ratio as any) || (video.player_settings?.default_ratio as any) || '16:9'
  })
  const [customHeight, setCustomHeight] = useState('360')
  const [transparentBg, setTransparentBg] = useState<boolean>(() => {
    return video.player_settings?.transparent_background ?? true
  })

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

  const origin = window.location.origin
  const embedUrl = `${origin}/?embed=${video.id}&ratio=${heightPreset}&width=${encodeURIComponent(resolvedWidth)}${transparentBg ? '&transparent=1' : ''}`

  const paddingTopMap: Record<string, string> = {
    '16:9': '56.25%',
    '9:16': '177.77%',
    '4:3': '75%',
  }

  const handleSelectRatio = async (ratio: '16:9' | '9:16' | '4:3' | 'custom') => {
    setHeightPreset(ratio)
    if (ratio === '16:9' || ratio === '9:16') {
      try {
        const updated = await updateVideo(video.id, {
          player_settings: {
            ...video.player_settings,
            aspect_ratio: ratio,
            default_ratio: ratio,
          },
        })
        if (onSave) onSave(updated)
      } catch {}
    }
  }

  const handleSelectWidth = async (w: '360' | '640' | '800' | '960' | '100%' | 'custom') => {
    setWidthPreset(w)
    if (w !== 'custom') {
      try {
        const updated = await updateVideo(video.id, {
          player_settings: {
            ...video.player_settings,
            default_width: `${w}px`,
          },
        })
        if (onSave) onSave(updated)
      } catch {}
    }
  }

  const currentCode = generateEmbedCode({
    video,
    embedUrl,
    embedType,
    resolvedWidth,
    resolvedHeight,
    heightPreset,
    paddingTopMap,
    transparentBg,
  })

  const handleToggleBackground = async (transparent: boolean) => {
    setTransparentBg(transparent)
    try {
      const updated = await updateVideo(video.id, {
        player_settings: {
          ...video.player_settings,
          transparent_background: transparent,
        },
      })
      if (onSave) onSave(updated)
      showToast(transparent ? 'Modo "Apenas o Vídeo" ativado: barras pretas removidas!' : 'Modo Fundo Preto (Cinema) ativado!')
    } catch {
      showToast(transparent ? 'Visualização "Apenas o Vídeo" ativada!' : 'Visualização Fundo Preto ativada!')
    }
  }

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
    <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* LINHA SUPERIOR: Dimensões (Esquerda) + Prévia do Player (Direita) Lado a Lado */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        alignItems: 'stretch',
      }}>
        {/* Coluna 1: Controles de Dimensões */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
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
              { label: '360px (Celular / Reels)', value: '360' },
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
                onClick={() => handleSelectWidth(opt.value as any)}
                style={{
                  padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
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
                  padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #10b981',
                  background: '#ffffff', color: '#1e293b', fontSize: '0.85rem', width: '120px', outline: 'none',
                }}
              />
            )}
          </div>
        </div>

        {/* Seleção de Altura / Proporção */}
        <div style={{ marginBottom: '1.25rem' }}>
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
                onClick={() => handleSelectRatio(opt.value as any)}
                style={{
                  padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
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

        {/* Fundo ao Redor do Vídeo (Remover Bordas Pretas) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Fundo ao Redor do Vídeo:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              data-testid="bg-preset-transparent"
              onClick={() => handleToggleBackground(true)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                border: transparentBg ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: transparentBg ? '#ecfdf5' : '#f8fafc',
                color: transparentBg ? '#065f46' : '#475569',
              }}
            >
              ✨ Apenas o Vídeo (Sem Fundo Preto)
            </button>
            <button
              type="button"
              data-testid="bg-preset-black"
              onClick={() => handleToggleBackground(false)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                border: !transparentBg ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: !transparentBg ? '#ecfdf5' : '#f8fafc',
                color: !transparentBg ? '#065f46' : '#475569',
              }}
            >
              🎬 Fundo Preto (Cinema)
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Dimensão configurada: <strong style={{ color: '#0f172a' }}>{resolvedWidth}</strong> ({heightPreset === 'custom' ? `${customHeight} fixa` : `proporção ${heightPreset}`})
        </span>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#4f46e5',
            fontSize: '0.82rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Abrir em nova aba <ExternalLink size={13} />
        </a>
      </div>
    </div>

    {/* Coluna 2: Prévia ao Vivo do Embed (Direita, ao lado das Dimensões) */}
    <div
      data-testid="embed-live-preview-card"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={18} color="#3b82f6" />
          Prévia do Player
        </h3>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: transparentBg ? '#059669' : '#2563eb',
          background: transparentBg ? '#ecfdf5' : '#eff6ff',
          padding: '0.2rem 0.6rem',
          borderRadius: '6px',
          border: transparentBg ? '1px solid #a7f3d0' : '1px solid #dbeafe',
        }}>
          {resolvedWidth} • {heightPreset === 'custom' ? customHeight : heightPreset} {transparentBg ? '• Apenas o Vídeo' : '• Cinema'}
        </span>
      </div>

      <div
        data-testid="embed-preview-viewport"
        style={{
          flex: 1,
          background: transparentBg
            ? 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px) 0 0 / 16px 16px, #f8fafc'
            : '#090d16',
          border: transparentBg ? '1px dashed #cbd5e1' : 'none',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          maxHeight: '400px',
          overflow: 'hidden',
          boxShadow: transparentBg ? 'none' : 'inset 0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: widthPreset === '100%' ? '100%' : (heightPreset === '9:16' ? '210px' : '380px'),
            maxHeight: '360px',
            margin: '0 auto',
            boxShadow: transparentBg ? '0 12px 25px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.6)',
            borderRadius: `${video.player_settings?.border_radius ?? 8}px`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: heightPreset === 'custom' && resolvedHeight ? undefined : (paddingTopMap[heightPreset] || '56.25%'),
              height: heightPreset === 'custom' && resolvedHeight ? resolvedHeight : undefined,
            }}
          >
            <iframe
              key={embedUrl}
              src={embedUrl}
              style={{
                position: heightPreset === 'custom' && resolvedHeight ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
                background: transparentBg ? 'transparent' : '#000',
              }}
              allow="autoplay *; fullscreen *; encrypted-media *"
              title="Prévia ao Vivo do Player"
            />
          </div>
        </div>
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
                padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                background: embedType === 'iframe' ? '#eef2ff' : '#f8fafc',
                color: embedType === 'iframe' ? '#4338ca' : '#64748b',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Iframe Responsivo
            </button>
            <button
              type="button"
              data-testid="embed-tab-type-script"
              onClick={() => setEmbedType('script')}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                background: embedType === 'script' ? '#eef2ff' : '#f8fafc',
                color: embedType === 'script' ? '#4338ca' : '#64748b',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Widget / Script
            </button>
          </div>
        </div>

        {/* Caixa de Código */}
        <div style={{ background: '#0d1117', borderRadius: '10px', padding: '1.25rem', position: 'relative', marginBottom: '1rem' }}>
          <pre
            data-testid="embed-code-text"
            style={{
              margin: 0, fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem', color: '#a7f3d0',
              overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: '6rem', lineHeight: 1.5,
            }}
          >
            {currentCode}
          </pre>

          <button
            type="button"
            data-testid="copy-embed-btn"
            onClick={handleCopy}
            style={{
              position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.9rem', borderRadius: '6px', border: 'none',
              background: copied ? '#10b981' : '#334155', color: '#ffffff',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
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
            marginBottom: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
            padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#166534', fontSize: '0.84rem', lineHeight: 1.4,
          }}
        >
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚡</span>
          <div>
            <strong>Sincronização em Tempo Real:</strong> Copie e cole este código no seu site <strong>uma única vez</strong>. Todas as configurações extras são carregadas dinamicamente e atualizadas automaticamente sempre que você salvar alterações no painel!
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#4f46e5', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center',
              gap: '0.4rem', fontWeight: 600, textDecoration: 'none',
            }}
          >
            Abrir Player em Nova Aba <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
