import React, { useState, useEffect, useMemo } from 'react'
import { Users, Search, RotateCcw } from 'lucide-react'
import type { Video, VideoLead } from '../../../types/video'
import { fetchVideoLeads } from '../../../services/api'
import { VTurbLeadsSummaryCards } from './VTurbLeadsSummaryCards'
import { VTurbLeadsTableRow } from './VTurbLeadsTableRow'
import { VTurbLeadsPagination } from './VTurbLeadsPagination'

interface VTurbLeadsTableProps {
  video: Video
  period?: string
  startDate?: string | null
  endDate?: string | null
  onLeadCountChange?: (count: number) => void
}

export const VTurbLeadsTable: React.FC<VTurbLeadsTableProps> = ({
  video,
  period = 'all',
  startDate,
  endDate,
  onLeadCountChange,
}) => {
  const [leads, setLeads] = useState<VideoLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 20

  const loadLeads = async () => {
    try {
      setLoading(true)
      const data = await fetchVideoLeads(video.id, {
        period,
        start_date: startDate,
        end_date: endDate,
      })
      setLeads(data.leads || [])
      if (onLeadCountChange) {
        onLeadCountChange(data.total_leads || 0)
      }
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    loadLeads()
  }, [video.id, period, startDate, endDate])

  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const formatBrtDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    try {
      const dt = new Date(dateStr)
      if (isNaN(dt.getTime())) return dateStr
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dt).replace(',', ' às')
    } catch {
      return dateStr
    }
  }

  const formatSeconds = (sec: number) => {
    const s = Math.round(sec || 0)
    const mins = Math.floor(s / 60)
    const rem = s % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads
    const term = searchTerm.toLowerCase().trim()
    return leads.filter((lead) => {
      const nameMatch = lead.name?.toLowerCase().includes(term)
      const phoneMatch = lead.phone?.toLowerCase().includes(term)
      const idMatch = lead.lead_id?.toLowerCase().includes(term)
      return Boolean(nameMatch || phoneMatch || idMatch)
    })
  }, [leads, searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const totalFiltered = filteredLeads.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFiltered)

  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice(startIndex, endIndex)
  }, [filteredLeads, startIndex, endIndex])

  const totalLeads = leads.length
  const leadsReachedCta = leads.filter((l) => l.reached_cta).length
  const ctaPercentage = totalLeads > 0 ? Math.round((leadsReachedCta / totalLeads) * 100) : 0
  const avgRetention =
    totalLeads > 0
      ? Math.round(leads.reduce((acc, curr) => acc + (curr.max_progress_percent || 0), 0) / totalLeads)
      : 0

  return (
    <div
      data-testid="vturb-panel-leads"
      style={{
        background: '#000000',
        borderRadius: '10px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Cards de Resumo dos Leads */}
      <VTurbLeadsSummaryCards
        totalLeads={totalLeads}
        leadsReachedCta={leadsReachedCta}
        ctaPercentage={ctaPercentage}
        avgRetention={avgRetention}
      />

      {/* Barra de Filtro e Busca */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            gap: '0.5rem',
            minWidth: '280px',
            flex: 1,
            maxWidth: '450px',
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            data-testid="input-search-leads"
            placeholder="Buscar por nome, telefone ou lead_id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        <button
          type="button"
          data-testid="btn-refresh-leads"
          onClick={loadLeads}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            borderRadius: '6px',
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <RotateCcw size={14} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Atualizando...' : 'Recarregar Contatos'}</span>
        </button>
      </div>

      {/* Tabela de Contatos */}
      {loading && leads.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          Carregando dados dos contatos da VSL...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div
          data-testid="leads-empty-state"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <Users size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
          <h5 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: '#ffffff' }}>
            Nenhum contato registrado {searchTerm ? 'para a busca informada' : 'nesta VSL ainda'}
          </h5>
          <p style={{ margin: '0 auto 1.25rem', fontSize: '0.82rem', color: '#94a3b8', maxWidth: '520px' }}>
            Quando um visitante identificado der play no vídeo, seus dados serão registrados
            automaticamente com o tempo assistido e o alcance da oferta.
          </p>
          <div
            style={{
              display: 'inline-block',
              textAlign: 'left',
              background: '#090d16',
              padding: '0.85rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#38bdf8',
              fontFamily: 'monospace',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            {`POST /videos/lead-event`}
            <br />
            {`{ "event": "vsl_play", "video_id": "${video.id}", "name": "...", "phone": "...", "lead_id": "..." }`}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            data-testid="table-leads"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Contato</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>WhatsApp / Telefone</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Lead ID</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Horário do Play</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Progresso na VSL</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Oferta (CTA)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => (
                <VTurbLeadsTableRow
                  key={lead.id}
                  lead={lead}
                  copiedId={copiedId}
                  onCopy={copyToClipboard}
                  formatBrtDateTime={formatBrtDateTime}
                  formatSeconds={formatSeconds}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação da Tabela de Contatos (máx. 20 por página) */}
      {!loading && filteredLeads.length > 0 && (
        <VTurbLeadsPagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={totalFiltered}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
