import React from 'react'
import { MousePointerClick, ExternalLink, Clock, Sparkles } from 'lucide-react'

interface CtaSettingsSectionProps {
  ctaEnabled: boolean
  setCtaEnabled: (val: boolean) => void
  ctaTime: number
  setCtaTime: (val: number) => void
  ctaText: string
  setCtaText: (val: string) => void
  ctaLink: string
  setCtaLink: (val: string) => void
  primaryColor: string
}

export const CtaSettingsSection: React.FC<CtaSettingsSectionProps> = ({
  ctaEnabled,
  setCtaEnabled,
  ctaTime,
  setCtaTime,
  ctaText,
  setCtaText,
  ctaLink,
  setCtaLink,
  primaryColor,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {/* Cabeçalho com Toggle de Ativação */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MousePointerClick size={18} color="#10b981" />
              Botão de Chamada para Ação (CTA)
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Exiba um botão de conversão no momento exato do seu pitch de vendas.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: ctaEnabled ? '#10b981' : '#64748b' }}>
            <input
              type="checkbox"
              data-testid="settings-cta-enable-check"
              checked={ctaEnabled}
              onChange={(e) => setCtaEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
            />
            {ctaEnabled ? 'CTA Ativado' : 'CTA Desativado'}
          </label>
        </div>

        {ctaEnabled ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Delay em Segundos */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Tempo de Delay (em segundos)
                </label>
                <input
                  type="number"
                  min="0"
                  data-testid="settings-cta-time-input"
                  value={ctaTime}
                  onChange={(e) => setCtaTime(Number(e.target.value))}
                  placeholder="ex: 60"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                  O botão surgirá automaticamente aos {ctaTime}s ({Math.floor(ctaTime / 60)}m {ctaTime % 60}s) de vídeo.
                </span>
              </div>

              {/* Texto do Botão */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Texto do Botão
                </label>
                <input
                  type="text"
                  data-testid="settings-cta-text-input"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="ex: Quero Garantir Minha Vaga"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Link de Destino */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                <ExternalLink size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                Link de Destino (Checkout / WhatsApp)
              </label>
              <input
                type="url"
                data-testid="settings-cta-link-input"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="https://pay.hotmart.com/... ou https://wa.me/..."
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Prévia Visual do Botão de Conversão */}
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Prévia do Botão de Conversão
              </span>
              <button
                type="button"
                data-testid="cta-preview-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                }}
              >
                <span>{ctaText || 'Botão de Exemplo'}</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', background: '#f8fafc', borderRadius: '8px' }}>
            O botão de CTA está desativado para este vídeo. Ative a opção acima para configurar o momento de exibição e o link de vendas.
          </div>
        )}
      </div>
    </div>
  )
}
