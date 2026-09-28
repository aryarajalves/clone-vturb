import { API_BASE, authHeaders, handleAuthResponse } from './api'
import type { VideoLeadsResponse, VideoLeadPlayPayload } from '../types/video'

/**
 * Consulta a lista de leads/contatos que deram play na VSL e seu progresso ao longo do tempo.
 */
export async function fetchVideoLeads(videoId: string): Promise<VideoLeadsResponse> {
  const res = await fetch(`${API_BASE}/videos/${videoId}/leads`, {
    headers: { ...authHeaders() },
  })
  handleAuthResponse(res)
  if (!res.ok) throw new Error('Falha ao carregar contatos do vídeo.')
  return res.json()
}

/**
 * Dispara o registro de play do lead para o endpoint da API no formato exato solicitado:
 * { event: "vsl_play", video_id, name, phone, lead_id }
 */
export async function trackLeadPlay(payload: VideoLeadPlayPayload): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/videos/lead-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error('Erro ao registrar play do lead:', err)
    return null
  }
}
