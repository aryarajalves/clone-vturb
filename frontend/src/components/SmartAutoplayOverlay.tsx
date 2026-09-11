import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { SmartAutoplaySettings, SmartAutoplaySize } from '../types/video'

export type { SmartAutoplaySize }

export const SMART_AUTOPLAY_SIZES: Record<
  SmartAutoplaySize,
  {
    maxWidth: string
    cardPadding: string
    borderRadius: string
    iconWrapperSize: string
    iconSize: number
    iconMarginBottom: string
    titleFontSize: string
    titleMargin: string
    subtitleFontSize: string
    subtitleMargin: string
    buttonPadding: string
    buttonFontSize: string
    buttonGap: string
    buttonIconSize: number
  }
> = {
  mini: {
    maxWidth: '250px',
    cardPadding: '0.75rem 1rem',
    borderRadius: '12px',
    iconWrapperSize: '32px',
    iconSize: 16,
    iconMarginBottom: '0.4rem',
    titleFontSize: '0.88rem',
    titleMargin: '0 0 0.2rem 0',
    subtitleFontSize: '0.7rem',
    subtitleMargin: '0 0 0.65rem 0',
    buttonPadding: '0.45rem 1rem',
    buttonFontSize: '0.75rem',
    buttonGap: '0.35rem',
    buttonIconSize: 14,
  },
  small: {
    maxWidth: '310px',
    cardPadding: '1rem 1.25rem',
    borderRadius: '14px',
    iconWrapperSize: '40px',
    iconSize: 20,
    iconMarginBottom: '0.6rem',
    titleFontSize: '1rem',
    titleMargin: '0 0 0.25rem 0',
    subtitleFontSize: '0.8rem',
    subtitleMargin: '0 0 0.85rem 0',
    buttonPadding: '0.55rem 1.25rem',
    buttonFontSize: '0.82rem',
    buttonGap: '0.45rem',
    buttonIconSize: 16,
  },
  medium: {
    maxWidth: '420px',
    cardPadding: '1.5rem 2rem',
    borderRadius: '18px',
    iconWrapperSize: '50px',
    iconSize: 26,
    iconMarginBottom: '0.85rem',
    titleFontSize: '1.18rem',
    titleMargin: '0 0 0.4rem 0',
    subtitleFontSize: '0.9rem',
    subtitleMargin: '0 0 1.25rem 0',
    buttonPadding: '0.75rem 1.75rem',
    buttonFontSize: '0.92rem',
    buttonGap: '0.55rem',
    buttonIconSize: 18,
  },
  large: {
    maxWidth: '500px',
    cardPadding: '1.85rem 2.5rem',
    borderRadius: '22px',
    iconWrapperSize: '60px',
    iconSize: 32,
    iconMarginBottom: '1rem',
    titleFontSize: '1.35rem',
    titleMargin: '0 0 0.5rem 0',
    subtitleFontSize: '1rem',
    subtitleMargin: '0 0 1.5rem 0',
    buttonPadding: '0.9rem 2.2rem',
    buttonFontSize: '1.05rem',
    buttonGap: '0.65rem',
    buttonIconSize: 22,
  },
}

interface SmartAutoplayOverlayProps {
  settings?: SmartAutoplaySettings
  onUnmute: () => void
}

export const SmartAutoplayOverlay: React.FC<SmartAutoplayOverlayProps> = ({
  settings,
  onUnmute,
}) => {
  const buttonColor = settings?.button_color || '#ef4444'
  const sizeKey: SmartAutoplaySize = (settings?.size as SmartAutoplaySize) || 'medium'
  const sizeConfig = SMART_AUTOPLAY_SIZES[sizeKey] || SMART_AUTOPLAY_SIZES.medium

  return (
    <div
      data-testid="smart-autoplay-overlay"
      onClick={onUnmute}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
        cursor: 'pointer',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <div
        data-testid="smart-autoplay-card"
        data-size={sizeKey}
        style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: sizeConfig.borderRadius,
          padding: sizeConfig.cardPadding,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: '90%',
          maxWidth: sizeConfig.maxWidth,
          boxSizing: 'border-box',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          data-testid="smart-autoplay-icon-wrapper"
          style={{
            width: sizeConfig.iconWrapperSize,
            height: sizeConfig.iconWrapperSize,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: sizeConfig.iconMarginBottom,
            transition: 'all 0.2s ease',
          }}
        >
          <VolumeX size={sizeConfig.iconSize} color="#ef4444" />
        </div>
        <h3
          data-testid="smart-autoplay-title"
          style={{
            fontSize: sizeConfig.titleFontSize,
            fontWeight: 800,
            color: '#ffffff',
            margin: sizeConfig.titleMargin,
            lineHeight: 1.25,
            transition: 'font-size 0.2s ease',
          }}
        >
          {settings?.text || 'Seu vídeo já começou!'}
        </h3>
        <p
          data-testid="smart-autoplay-subtitle"
          style={{
            fontSize: sizeConfig.subtitleFontSize,
            color: '#cbd5e1',
            margin: sizeConfig.subtitleMargin,
            lineHeight: 1.35,
            transition: 'font-size 0.2s ease',
          }}
        >
          {settings?.subtext || 'Clique no botão abaixo para ativar o som'}
        </p>
        <button
          data-testid="smart-autoplay-unmute-btn"
          onClick={(e) => {
            e.stopPropagation()
            onUnmute()
          }}
          style={{
            padding: sizeConfig.buttonPadding,
            borderRadius: '50px',
            background: buttonColor,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: sizeConfig.buttonFontSize,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 8px 25px ${buttonColor}88`,
            display: 'flex',
            alignItems: 'center',
            gap: sizeConfig.buttonGap,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
          }}
        >
          <Volume2 size={sizeConfig.buttonIconSize} />
          {settings?.button_text || 'CLIQUE PARA OUVIR'}
        </button>
      </div>
    </div>
  )
}
