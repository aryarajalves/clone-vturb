import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Video } from '../../types/video'
import { fetchVideo } from '../../services/api'
import { PreviewTopHeader } from './PreviewTopHeader'
import { PreviewPlayerWrapper } from './PreviewPlayerWrapper'
import { PreviewMockLandingPageSections } from './PreviewMockLandingPageSections'
import { useFloatingPlayerObserver } from './useFloatingPlayerObserver'

interface VideoPreviewTestPageProps {
  videoId: string
}

export const VideoPreviewTestPage: React.FC<VideoPreviewTestPageProps> = ({ videoId }) => {
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const rawRatio = queryParams.get('ratio') || '16:9'
  const rawWidth = queryParams.get('width') || '640px'
  const rawHeight = queryParams.get('height')
  const transparentParam = queryParams.get('transparent')
  const isTransparent = transparentParam !== null
    ? (transparentParam === '1' || transparentParam === 'true')
    : Boolean(video?.player_settings?.transparent_background ?? true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        setLoading(true)
        const data = await fetchVideo(videoId)
        if (isMounted) setVideo(data)
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Erro ao carregar dados do vídeo.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [videoId])

  const effectiveRatio = (rawRatio === '9:16' || rawRatio === '9-16' || rawRatio === '9/16')
    ? '9:16'
    : (rawRatio === '4:3' ? '4:3' : (rawRatio === 'custom' || rawHeight ? 'custom' : '16:9'))
  const paddingTop = rawHeight || effectiveRatio === 'custom'
    ? '0'
    : effectiveRatio === '9:16'
    ? '177.77%'
    : effectiveRatio === '4:3'
    ? '75%'
    : '56.25%'
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const embedSrc = `${origin}/?embed=${videoId}&ratio=${effectiveRatio}&width=${encodeURIComponent(rawWidth)}&transparent=${isTransparent ? '1' : '0'}${rawHeight ? `&height=${encodeURIComponent(rawHeight)}` : ''}`

  const { isPitchReached } = useFloatingPlayerObserver({
    video,
    videoId,
    effectiveRatio,
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Carregando página de teste do Smart VSL...</span>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem' }}>
        <h2 style={{ color: '#f87171' }}>Não foi possível carregar a página de teste</h2>
        <p style={{ color: '#94a3b8' }}>{error || 'Vídeo não encontrado.'}</p>
        <a href="/" style={{ color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </a>
      </div>
    )
  }

  const pitchEnabled = Boolean(video.player_settings?.pitch_delay?.enabled)

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      <PreviewTopHeader
        rawWidth={rawWidth}
        rawHeight={rawHeight}
        effectiveRatio={effectiveRatio}
        isTransparent={isTransparent}
      />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 1.5rem 6rem' }}>
        <PreviewPlayerWrapper
          video={video}
          rawWidth={rawWidth}
          rawHeight={rawHeight}
          paddingTop={paddingTop}
          isTransparent={isTransparent}
          embedSrc={embedSrc}
          pitchEnabled={pitchEnabled}
          isPitchReached={isPitchReached}
        />

        <PreviewMockLandingPageSections />
      </main>
    </div>
  )
}
