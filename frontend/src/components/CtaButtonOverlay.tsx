import React from 'react'
import { ExternalLink } from 'lucide-react'

interface CtaButtonOverlayProps {
  show: boolean
  ctaLink?: string
  ctaText?: string
  onClick: () => void
}

export const CtaButtonOverlay: React.FC<CtaButtonOverlayProps> = ({
  show,
  ctaLink,
  ctaText,
  onClick,
}) => {
  if (!show || !ctaLink) return null

  return (
    <div
      data-testid="cta-button-container"
      style={{
        position: 'absolute',
        bottom: '24px',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease',
      }}
    >
      <a
        href={ctaLink}
        target="_top"
        onClick={onClick}
        data-testid="cta-button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.9rem 1.8rem',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.05rem',
          textDecoration: 'none',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {ctaText || 'Quero Comprar Agora'}
        <ExternalLink size={18} />
      </a>
    </div>
  )
}
