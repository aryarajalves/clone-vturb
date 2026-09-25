import React from 'react'
import { Eye } from 'lucide-react'
import type { Video } from '../../../types/video'

interface EmbedLivePreviewCardProps {
  video: Video
  embedUrl: string
  resolvedWidth: string
  widthPreset: string
  heightPreset: string
  customHeight: string
  resolvedHeight: string | null
  transparentBg: boolean
  paddingTopMap: Record<string, string>
}

export const EmbedLivePreviewCard: React.FC<EmbedLivePreviewCardProps> = ({
  video,
  embedUrl,
  resolvedWidth,
  widthPreset,
  heightPreset,
  customHeight,
  resolvedHeight,
  transparentBg,
  paddingTopMap,
}) => {
  return (
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
          <Eye size={18} color="#3b82f6" />
          Prévia do Player
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: transparentBg ? '#059669' : '#2563eb',
            background: transparentBg ? '#ecfdf5' : '#eff6ff',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            border: transparentBg ? '1px solid #a7f3d0' : '1px solid #dbeafe',
          }}
        >
          {resolvedWidth} • {heightPreset === 'custom' ? customHeight : heightPreset}{' '}
          {transparentBg ? '• Apenas o Vídeo' : '• Cinema'}
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
            maxWidth: widthPreset === '100%' ? '100%' : heightPreset === '9:16' ? '210px' : '380px',
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
              paddingTop:
                heightPreset === 'custom' && resolvedHeight
                  ? undefined
                  : paddingTopMap[heightPreset] || '56.25%',
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
  )
}
