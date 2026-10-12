import React, { useState } from 'react'
import {
  Check,
  Copy,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import type { DocTopic } from './types'
import { DocTopicScreenshot } from './DocTopicScreenshot'

interface DocTopicDetailProps {
  topic: DocTopic
  onSelectTopic: (topicId: string) => void
  prevTopic?: DocTopic | null
  nextTopic?: DocTopic | null
}

export const DocTopicDetail: React.FC<DocTopicDetailProps> = ({
  topic,
  onSelectTopic,
  prevTopic,
  nextTopic,
}) => {
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <article
      data-testid="doc-topic-detail"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '2.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header do Tópico */}
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#0284c7',
              backgroundColor: '#e0f2fe',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
            }}
          >
            {topic.category}
          </span>
          {topic.badge && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#166534',
                backgroundColor: '#dcfce7',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
              }}
            >
              {topic.badge}
            </span>
          )}
        </div>

        <h1
          data-testid="doc-topic-title"
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.5px',
          }}
        >
          {topic.title}
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          {topic.subtitle}
        </p>
      </div>

      {/* Resumo */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderLeft: '4px solid #0284c7',
          padding: '1rem 1.25rem',
          borderRadius: '0 8px 8px 0',
          marginBottom: '2rem',
          color: '#334155',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        {topic.summary}
      </div>

      {/* Imagem Ilustrativa Capturada da Ferramenta */}
      <DocTopicScreenshot
        image={topic.image}
        caption={topic.imageCaption}
        title={topic.title}
        label="VISUALIZAÇÃO NA FERRAMENTA"
        badgeText="Captura Real"
        testId="doc-topic-image-container"
      />

      {/* Imagem Secundária se houver */}
      {topic.secondaryImage && (
        <DocTopicScreenshot
          image={topic.secondaryImage}
          caption={topic.secondaryImageCaption}
          title={`${topic.title} - Detalhe`}
          label="TELA COMPLEMENTAR (CRIAÇÃO / UPLOAD)"
          badgeText="Passo a Passo"
          testId="doc-topic-secondary-image-container"
        />
      )}

      {/* Passos Numerados */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '1.25rem',
          }}
        >
          Passo a Passo Como Usar:
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {topic.steps.map((step) => (
            <div
              key={step.stepNumber}
              data-testid={`doc-step-${step.stepNumber}`}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                {step.stepNumber}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: '0 0 0.35rem 0',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.55 }}>
                  {step.description}
                </p>
                {step.detail && (
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.85rem',
                      color: '#64748b',
                      backgroundColor: '#f8fafc',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      lineHeight: 1.45,
                    }}
                  >
                    💡 {step.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exemplo de Código se houver */}
      {topic.codeExample && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              {topic.codeExample.caption}
            </span>
            <button
              type="button"
              data-testid="btn-copy-doc-code"
              onClick={() => handleCopyCode(topic.codeExample!.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: copiedCode ? '#166534' : '#0284c7',
                background: copiedCode ? '#dcfce7' : '#f0f9ff',
                border: '1px solid',
                borderColor: copiedCode ? '#bbf7d0' : '#bae6fd',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? 'Copiado!' : 'Copiar Código'}
            </button>
          </div>
          <pre
            data-testid="doc-code-block"
            style={{
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              padding: '1.25rem',
              borderRadius: '10px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              overflowX: 'auto',
              margin: 0,
            }}
          >
            {topic.codeExample.code}
          </pre>
        </div>
      )}

      {/* Dicas e Alertas */}
      {topic.tips && topic.tips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {topic.tips.map((tip, idx) => {
            const isWarn = tip.type === 'warning'
            const isInfo = tip.type === 'info'
            const bgColor = isWarn ? '#fffbeb' : isInfo ? '#f0fdf4' : '#f0f9ff'
            const borderColor = isWarn ? '#fde68a' : isInfo ? '#bbf7d0' : '#bae6fd'
            const iconColor = isWarn ? '#d97706' : isInfo ? '#16a34a' : '#0284c7'

            return (
              <div
                key={idx}
                data-testid={`doc-tip-${idx}`}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }}>
                  {isWarn ? (
                    <AlertTriangle size={18} />
                  ) : isInfo ? (
                    <Info size={18} />
                  ) : (
                    <Lightbulb size={18} />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                    {tip.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                    {tip.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Navegação Entre Tópicos (Anterior / Próximo) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1.75rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {prevTopic ? (
          <button
            type="button"
            data-testid="btn-doc-prev"
            onClick={() => onSelectTopic(prevTopic.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft size={16} />
            <span>Anterior: {prevTopic.title.split('&')[0].trim()}</span>
          </button>
        ) : (
          <div />
        )}

        {nextTopic && (
          <button
            type="button"
            data-testid="btn-doc-next"
            onClick={() => onSelectTopic(nextTopic.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0284c7',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.15)',
            }}
          >
            <span>Próximo: {nextTopic.title.split('&')[0].trim()}</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </article>
  )
}
