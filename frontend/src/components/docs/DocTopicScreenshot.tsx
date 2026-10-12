import React from 'react'

interface DocTopicScreenshotProps {
  image?: string
  caption?: string
  title: string
  label?: string
  badgeText?: string
  testId?: string
}

export const DocTopicScreenshot: React.FC<DocTopicScreenshotProps> = ({
  image,
  caption,
  title,
  label = 'VISUALIZAÇÃO NA FERRAMENTA',
  badgeText = 'Captura Real',
  testId = 'doc-topic-image-container',
}) => {
  if (!image) return null

  return (
    <div
      data-testid={testId}
      style={{
        marginBottom: '2.5rem',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
      }}
    >
      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: '#0b1329',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.3px' }}>
            {label}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
          }}
        >
          {badgeText}
        </span>
      </div>

      <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center', backgroundColor: '#020617' }}>
        <img
          src={image}
          alt={title}
          data-testid={testId === 'doc-topic-image-container' ? 'doc-topic-screenshot' : 'doc-topic-secondary-screenshot'}
          style={{
            width: '100%',
            maxHeight: '480px',
            objectFit: 'contain',
            borderRadius: '6px',
            display: 'block',
          }}
        />
      </div>

      {caption && (
        <div
          data-testid={testId === 'doc-topic-image-container' ? 'doc-topic-image-caption' : undefined}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#0b1329',
            borderTop: '1px solid #1e293b',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ color: '#38bdf8' }}>📸</span>
          <span>{caption}</span>
        </div>
      )}
    </div>
  )
}
