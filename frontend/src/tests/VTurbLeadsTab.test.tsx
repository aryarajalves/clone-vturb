import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VTurbRetentionChart } from '../components/video-detail/metrics/VTurbRetentionChart'
import { VTurbLeadsTable } from '../components/video-detail/metrics/VTurbLeadsTable'
import type { Video, VideoMetrics, VideoLeadsResponse } from '../types/video'
import * as api from '../services/api'

describe('VTurbLeadsTab - Rastreamento e Visualização de Contatos que Deram Play', () => {
  const mockVideo: Video = {
    id: 'c6818306-fbe3-4919-b404-2f5b99424bc1',
    title: 'VSL - Bussola',
    video_url: 'https://cdn.vturb.com/videos/vsl-bussola.mp4',
    thumbnail_url: 'https://cdn.vturb.com/thumbnails/vsl-bussola.jpg',
    duration: 280, // 04:40
    player_settings: {
      primary_color: '#10b981',
      autoplay: false,
      show_controls: true,
      cta_enabled: true,
      cta_time: 240, // Oferta aos 04:00
      cta_text: 'Quero Minha Bússola',
      cta_link: 'https://checkout.bussola.com',
    },
    created_at: '2026-09-28T10:00:00Z',
    updated_at: '2026-09-28T10:00:00Z',
  }

  const mockMetrics: VideoMetrics = {
    video_id: mockVideo.id,
    period: 'all',
    total_impressions: 15,
    unique_impressions: 10,
    total_plays: 8,
    unique_plays: 5,
    play_rate: 53.3,
    total_clicks: 3,
    ctr: 37.5,
    avg_watch_time_seconds: 160,
    retention: { '25%': 5, '50%': 4, '75%': 3, '100%': 2 },
    hourly_distribution: [],
    peak_hour: null,
  }

  const mockLeadsData: VideoLeadsResponse = {
    video_id: mockVideo.id,
    total_leads: 2,
    leads_reached_cta: 1,
    leads: [
      {
        id: 1,
        video_id: mockVideo.id,
        lead_id: '20260928-164404-3054288f',
        name: 'Flavia Fernandes',
        phone: '+55 (18) 99787-7100',
        session_id: 'sess-flavia-1',
        event: 'vsl_play',
        watch_time_seconds: 245.0,
        max_progress_percent: 87.5,
        reached_cta: true,
        play_count: 2,
        first_play_at: '2026-09-28T16:44:04Z',
        last_seen_at: '2026-09-28T16:48:09Z',
        created_at: '2026-09-28T16:44:04Z',
      },
      {
        id: 2,
        video_id: mockVideo.id,
        lead_id: '20260928-170010-98765432',
        name: 'Carlos Oliveira',
        phone: '+55 (11) 98888-2222',
        session_id: 'sess-carlos-2',
        event: 'vsl_play',
        watch_time_seconds: 70.0,
        max_progress_percent: 25.0,
        reached_cta: false,
        play_count: 1,
        first_play_at: '2026-09-28T17:00:10Z',
        last_seen_at: '2026-09-28T17:01:20Z',
        created_at: '2026-09-28T17:00:10Z',
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'fetchVideoLeads').mockResolvedValue(mockLeadsData)
  })

  it('exibe a nova sub-aba Contatos no VTurbRetentionChart e transiciona para a visualização ao clicar', async () => {
    render(<VTurbRetentionChart video={mockVideo} metrics={mockMetrics} defaultTab="retention" />)

    // Verifica que a aba Contatos está presente no menu de abas
    const leadsTabButton = screen.getByTestId('vturb-tab-leads')
    expect(leadsTabButton).toBeInTheDocument()
    expect(leadsTabButton.textContent).toBe('Contatos')

    // Clica na aba Contatos
    fireEvent.click(leadsTabButton)

    // O painel vturb-panel-leads deve ser renderizado
    await waitFor(() => {
      expect(screen.getByTestId('vturb-panel-leads')).toBeInTheDocument()
    })
  })

  it('renderiza os cards de resumo com total de contatos e contatos que alcançaram a oferta', async () => {
    render(<VTurbLeadsTable video={mockVideo} />)

    await waitFor(() => {
      expect(screen.getByTestId('leads-total-count')).toHaveTextContent('2')
      expect(screen.getByTestId('leads-cta-count')).toHaveTextContent('1')
    })
  })

  it('renderiza a tabela com nome, telefone formatado, lead_id, tempo e badge de oferta', async () => {
    render(<VTurbLeadsTable video={mockVideo} />)

    await waitFor(() => {
      // Lead 1: Flavia Fernandes
      expect(screen.getByText('Flavia Fernandes')).toBeInTheDocument()
      expect(screen.getByText('+55 (18) 99787-7100')).toBeInTheDocument()
      expect(screen.getByText('20260928-164404-3054288f')).toBeInTheDocument()
      expect(screen.getByText('Deu play 2x')).toBeInTheDocument()
      expect(screen.getByText('Chegou na Oferta')).toBeInTheDocument()

      // Lead 2: Carlos Oliveira
      expect(screen.getByText('Carlos Oliveira')).toBeInTheDocument()
      expect(screen.getByText('+55 (11) 98888-2222')).toBeInTheDocument()
      expect(screen.getByText('Assistindo')).toBeInTheDocument()
    })
  })

  it('permite filtrar contatos em tempo real pelo campo de busca', async () => {
    render(<VTurbLeadsTable video={mockVideo} />)

    await waitFor(() => {
      expect(screen.getByText('Flavia Fernandes')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('input-search-leads')
    fireEvent.change(searchInput, { target: { value: 'Flavia' } })

    expect(screen.getByText('Flavia Fernandes')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Oliveira')).not.toBeInTheDocument()

    // Busca por telefone
    fireEvent.change(searchInput, { target: { value: '98888-2222' } })
    expect(screen.getByText('Carlos Oliveira')).toBeInTheDocument()
    expect(screen.queryByText('Flavia Fernandes')).not.toBeInTheDocument()
  })

  it('exibe estado vazio explicativo quando não houver leads registrados', async () => {
    vi.spyOn(api, 'fetchVideoLeads').mockResolvedValueOnce({
      video_id: mockVideo.id,
      total_leads: 0,
      leads_reached_cta: 0,
      leads: [],
    })

    render(<VTurbLeadsTable video={mockVideo} />)

    await waitFor(() => {
      expect(screen.getByTestId('leads-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/Nenhum contato registrado nesta VSL ainda/i)).toBeInTheDocument()
    })
  })
})
