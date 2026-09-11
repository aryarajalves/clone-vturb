import type { Video, VideoMetrics, PlayerSettings } from '../types/video'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8003'

export async function fetchVideos(): Promise<Video[]> {
  const res = await fetch(`${API_BASE}/videos/`)
  if (!res.ok) throw new Error('Falha ao carregar lista de vídeos.')
  return res.json()
}

export async function fetchVideo(id: string): Promise<Video> {
  const res = await fetch(`${API_BASE}/videos/${id}`)
  if (!res.ok) throw new Error('Falha ao carregar dados do vídeo.')
  return res.json()
}

export async function createVideo(data: {
  title: string
  video_url: string
  thumbnail_url?: string
  duration?: number
  player_settings?: Partial<PlayerSettings>
}): Promise<Video> {
  const res = await fetch(`${API_BASE}/videos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao criar o vídeo.')
  return res.json()
}

export async function updateVideo(
  id: string,
  data: {
    title?: string
    video_url?: string
    thumbnail_url?: string
    player_settings?: Partial<PlayerSettings>
  }
): Promise<Video> {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Falha ao atualizar o vídeo.')
  return res.json()
}

export async function deleteVideo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Falha ao excluir o vídeo.')
}

export async function bulkDeleteVideos(ids: string[]): Promise<{ deleted_count: number; deleted_ids: string[] }> {
  const res = await fetch(`${API_BASE}/videos/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_ids: ids }),
  })
  if (!res.ok) throw new Error('Falha ao excluir os vídeos selecionados.')
  return res.json()
}

export async function fetchVideoMetrics(
  id: string,
  params?: {
    period?: string
    start_date?: string
    end_date?: string
  }
): Promise<VideoMetrics> {
  const query = new URLSearchParams()
  if (params?.period) query.set('period', params.period)
  if (params?.start_date) query.set('start_date', params.start_date)
  if (params?.end_date) query.set('end_date', params.end_date)

  const qs = query.toString() ? `?${query.toString()}` : ''
  const res = await fetch(`${API_BASE}/videos/${id}/metrics${qs}`)
  if (!res.ok) throw new Error('Falha ao obter métricas do vídeo.')
  return res.json()
}

export async function sendTelemetryEvent(
  videoId: string,
  event: {
    event_type: string
    watch_time_seconds?: number
    session_id?: string
    referer?: string
  }
): Promise<void> {
  try {
    await fetch(`${API_BASE}/videos/${videoId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
  } catch (err) {
    console.error('Erro ao enviar telemetria:', err)
  }
}

export async function uploadFile(file: File): Promise<{ filename: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/videos/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Falha ao realizar upload do arquivo.')
  }

  const data = await res.json()
  return {
    filename: data.filename,
    url: getMediaUrl(data.url),
  }
}

export function getMediaUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  return `${API_BASE}${url}`
}

