import React from 'react'
import { Clock, Copy, Check, MessageCircle, Target } from 'lucide-react'
import type { VideoLead } from '../../../types/video'

interface VTurbLeadsTableRowProps {
  lead: VideoLead
  copiedId: string | null
  onCopy: (text: string, id: string) => void
  formatBrtDateTime: (dateStr?: string | null) => string
  formatSeconds: (sec: number) => string
}

export const VTurbLeadsTableRow: React.FC<VTurbLeadsTableRowProps> = ({
  lead,
  copiedId,
  onCopy,
  formatBrtDateTime,
  formatSeconds,
}) => {
  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : ''
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null
  const initial = (lead.name || 'V').trim().charAt(0).toUpperCase()
  const progressPct = Math.round(lead.max_progress_percent || 0)
  const watchFormatted = formatSeconds(lead.watch_time_seconds || 0)

  return (
    <tr
      data-testid={`lead-row-${lead.id}`}
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'background 0.15s ease',
      }}
    >
      {/* Contato (Avatar + Nome) */}
      <td style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div>
            <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.85rem' }}>
              {lead.name || 'Contato Sem Nome'}
            </strong>
            {lead.play_count > 1 && (
              <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                Deu play {lead.play_count}x
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Telefone / WhatsApp */}
      <td style={{ padding: '0.75rem' }}>
        {lead.phone ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#cbd5e1' }}>{lead.phone}</span>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                title="Abrir WhatsApp"
                style={{
                  color: '#22c55e',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  background: 'rgba(34, 197, 94, 0.1)',
                }}
              >
                <MessageCircle size={14} />
              </a>
            )}
          </div>
        ) : (
          <span style={{ color: '#64748b' }}>-</span>
        )}
      </td>

      {/* Lead ID */}
      <td style={{ padding: '0.75rem' }}>
        {lead.lead_id ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#94a3b8',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={lead.lead_id}
            >
              {lead.lead_id}
            </span>
            <button
              type="button"
              onClick={() => onCopy(lead.lead_id!, String(lead.id))}
              title="Copiar Lead ID"
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedId === String(lead.id) ? '#22c55e' : '#64748b',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              {copiedId === String(lead.id) ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        ) : (
          <span style={{ color: '#64748b' }}>-</span>
        )}
      </td>

      {/* Primeiro Play */}
      <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} color="#64748b" />
          <span>{formatBrtDateTime(lead.first_play_at || lead.created_at)}</span>
        </div>
      </td>

      {/* Progresso na VSL */}
      <td style={{ padding: '0.75rem', minWidth: '150px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>{progressPct}%</span>
            <span style={{ color: '#94a3b8' }}>{watchFormatted}</span>
          </div>
          <div
            style={{
              height: '6px',
              background: '#1e293b',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, progressPct))}%`,
                height: '100%',
                background: progressPct >= 75 ? '#22c55e' : progressPct >= 25 ? '#38bdf8' : '#eab308',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </td>

      {/* Status da Oferta (CTA) */}
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {lead.reached_cta ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              fontWeight: 700,
              fontSize: '0.74rem',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <Target size={12} /> Chegou na Oferta
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              background: 'rgba(148, 163, 184, 0.1)',
              color: '#94a3b8',
              fontSize: '0.74rem',
            }}
          >
            Assistindo
          </span>
        )}
      </td>
    </tr>
  )
}
