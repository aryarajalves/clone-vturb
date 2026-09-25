import React, { useState } from 'react'
import type { Video } from '../../types/video'
import { generateEmbedCode } from '../../utils/embedScriptGenerator'
import { updateVideo } from '../../services/api'
import {
  EmbedDimensionControls,
  EmbedLivePreviewCard,
  EmbedCodeSnippetBox,
  resolveWidth,
  resolveHeight,
  buildEmbedUrls,
  paddingTopMap,
} from './embed'

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

  const resolvedWidth = resolveWidth(widthPreset, customWidth)
  const resolvedHeight = resolveHeight(heightPreset, customHeight)

  const { embedUrl, previewTestUrl } = buildEmbedUrls(
    video.id,
    heightPreset,
    resolvedWidth,
    resolvedHeight,
    transparentBg
  )

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
      showToast(
        transparent
          ? 'Modo "Apenas o Vídeo" ativado: barras pretas removidas!'
          : 'Modo Fundo Preto (Cinema) ativado!'
      )
    } catch {
      showToast(
        transparent ? 'Visualização "Apenas o Vídeo" ativada!' : 'Visualização Fundo Preto ativada!'
      )
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        <EmbedDimensionControls
          widthPreset={widthPreset}
          customWidth={customWidth}
          setCustomWidth={setCustomWidth}
          onSelectWidth={handleSelectWidth}
          heightPreset={heightPreset}
          customHeight={customHeight}
          setCustomHeight={setCustomHeight}
          onSelectRatio={handleSelectRatio}
          transparentBg={transparentBg}
          onToggleBackground={handleToggleBackground}
          resolvedWidth={resolvedWidth}
          previewTestUrl={previewTestUrl}
        />

        <EmbedLivePreviewCard
          video={video}
          embedUrl={embedUrl}
          resolvedWidth={resolvedWidth}
          widthPreset={widthPreset}
          heightPreset={heightPreset}
          customHeight={customHeight}
          resolvedHeight={resolvedHeight}
          transparentBg={transparentBg}
          paddingTopMap={paddingTopMap}
        />
      </div>

      {/* BLOCO 2: Código de Incorporação */}
      <EmbedCodeSnippetBox
        embedType={embedType}
        setEmbedType={setEmbedType}
        currentCode={currentCode}
        copied={copied}
        onCopy={handleCopy}
        embedUrl={embedUrl}
      />
    </div>
  )
}
