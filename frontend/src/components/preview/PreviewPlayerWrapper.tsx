import React from 'react'
import { Sparkles } from 'lucide-react'
import type { Video } from '../../types/video'

interface PreviewPlayerWrapperProps {
  video: Video
  rawWidth: string
  rawHeight: string | null
  paddingTop: string
  isTransparent: boolean
  embedSrc: string
  pitchEnabled: boolean
  isPitchReached: boolean
}

export const PreviewPlayerWrapper: React.FC<PreviewPlayerWrapperProps> = ({
  video,
  rawWidth,
  rawHeight,
  paddingTop,
  isTransparent,
  embedSrc,
  pitchEnabled,
  isPitchReached,
}) => {
  return (
    <>
      {/* Seção Hero: Título VSL */}
      <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            color: '#a5b4fc',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={14} /> Prévia Oficial de Conversão
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '0 0 1rem',
            color: '#ffffff',
          }}
        >
          {video.title || 'Apresentação Exclusiva em Vídeo'}
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#94a3b8',
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.6,
          }}
        >
          Assista ao vídeo abaixo. Ao rolar para baixo para ler os detalhes da oferta, o player se transformará
          automaticamente em miniatura flutuante no canto inferior.
        </p>
      </section>

      {/* Player de Vídeo Incorporado */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div
          id={`vturb-wrapper-${video.id}`}
          data-testid="preview-test-wrapper"
          style={{
            maxWidth: rawWidth,
            width: '100%',
            height: rawHeight || 'auto',
            margin: '0 auto',
            position: 'relative',
            background: isTransparent ? 'transparent' : '#000000',
            borderRadius: `${video.player_settings?.border_radius ?? 12}px`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: rawHeight ? '100%' : 'auto',
              paddingTop: rawHeight ? 0 : paddingTop,
              background: isTransparent ? 'transparent' : '#000000',
            }}
          >
            <iframe
              src={embedSrc}
              data-testid="preview-test-iframe"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
                borderRadius: `${video.player_settings?.border_radius ?? 12}px`,
                background: isTransparent ? 'transparent' : '#000000',
              }}
              allow="autoplay *; fullscreen *; encrypted-media *"
              allowFullScreen
            />
          </div>
        </div>

        {/* Botão de Pitch Delay (se configurado) */}
        {pitchEnabled && (
          <div
            className="delay-pitch"
            style={{
              display: isPitchReached ? 'block' : 'none',
              textAlign: 'center',
              marginTop: '2rem',
              animation: 'fadeIn 0.5s ease',
            }}
          >
            <button
              type="button"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '1.15rem',
                fontWeight: 700,
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              }}
            >
              🔥 QUERO GARANTIR MEU ACESSO AGORA!
            </button>
          </div>
        )}
      </section>
    </>
  )
}
