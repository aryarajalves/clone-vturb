import React, { useRef, useState, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Sparkles,
  Smartphone,
  Monitor,
} from 'lucide-react'
import { VolumeControl } from '../../VolumeControl'
import type { Video, ChaptersSettings } from '../../../types/video'
import { getMediaUrl } from '../../../services/api'

interface StylingVideoPreviewProps {
  video: Video
  primaryColor: string
  playShape: 'circle' | 'rounded' | 'square' | 'minimal'
  playSize: 'small' | 'medium' | 'large'
  rewind10s: boolean
  forward10s: boolean
  volume: boolean
  fullscreen: boolean
  speedControl: boolean
  borderRadius?: number
  progressBar?: boolean
  videoTime?: boolean
  aspectRatio?: '16:9' | '9:16'
  onAspectRatioChange?: (val: '16:9' | '9:16') => void
  chapters?: ChaptersSettings
}

export const StylingVideoPreview: React.FC<StylingVideoPreviewProps> = ({
  video,
  primaryColor,
  playShape,
  playSize,
  rewind10s,
  forward10s,
  volume,
  fullscreen,
  speedControl,
  borderRadius = 0,
  progressBar = true,
  videoTime = true,
  aspectRatio = '16:9',
  onAspectRatioChange,
  chapters,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(video.duration || 60)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(1.0)
  const [currentSpeed, setCurrentSpeed] = useState(1.0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = currentSpeed
    }
  }, [currentSpeed])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = target
      setCurrentTime(target)
    }
  }

  const handleRewind10 = () => {
    if (!videoRef.current) return
    const nextTime = Math.max(0, videoRef.current.currentTime - 10)
    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handleForward10 = () => {
    if (!videoRef.current) return
    const nextTime = Math.min(duration, videoRef.current.currentTime + 10)
    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const nextMute = !isMuted
    videoRef.current.muted = nextMute
    setIsMuted(nextMute)
    if (!nextMute && videoRef.current.volume === 0) {
      videoRef.current.volume = 1.0
      setVolumeLevel(1.0)
    }
  }

  const handleVolumeChange = (val: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = val
    setVolumeLevel(val)
    if (val === 0) {
      videoRef.current.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
    }
  }

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0]
    const nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length
    setCurrentSpeed(speeds[nextIdx])
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getButtonRadius = () =>
    playShape === 'circle' || playShape === 'minimal' ? '50%' : playShape === 'rounded' ? '18px' : '8px'

  const getPlayPixelSize = () => (playSize === 'small' ? 56 : playSize === 'large' ? 96 : 76)


  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#4f46e5" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
            Prévia Visual em Tempo Real
          </h3>
        </div>

        {/* Alternador Rápido de Proporção (16:9 Desktop vs 9:16 Celular) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            data-testid="preview-toggle-16-9"
            onClick={() => onAspectRatioChange?.('16:9')}
            style={{
              padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              border: aspectRatio === '16:9' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
              background: aspectRatio === '16:9' ? '#eef2ff' : '#ffffff', color: aspectRatio === '16:9' ? '#4338ca' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s ease',
            }}
          >
            <Monitor size={14} />
            <span>16:9</span>
          </button>
          <button
            type="button"
            data-testid="preview-toggle-9-16"
            onClick={() => onAspectRatioChange?.('9:16')}
            style={{
              padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              border: aspectRatio === '9:16' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
              background: aspectRatio === '9:16' ? '#eef2ff' : '#ffffff', color: aspectRatio === '9:16' ? '#4338ca' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s ease',
            }}
          >
            <Smartphone size={14} />
            <span>9:16 Celular</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        data-testid="styling-video-preview-container"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: aspectRatio === '9:16' ? '340px' : '100%',
          aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
          margin: '0 auto',
          backgroundColor: '#0a0c10',
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
          boxShadow: aspectRatio === '9:16'
            ? '0 14px 40px rgba(0,0,0,0.35), 0 0 0 6px #1e293b'
            : '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <video
          ref={videoRef}
          data-testid="styling-preview-video"
          src={getMediaUrl(video.video_url)}
          poster={getMediaUrl(video.thumbnail_url)}
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
        />

        {/* Botão Central de Play Grande */}
        {!isPlaying && (
          <div
            data-testid="styling-big-play-btn"
            onClick={togglePlay}
            style={{
              position: 'absolute',
              width: `${getPlayPixelSize()}px`,
              height: `${getPlayPixelSize()}px`,
              borderRadius: getButtonRadius(),
              backgroundColor: playShape === 'minimal' ? 'rgba(0,0,0,0.65)' : primaryColor,
              border: playShape === 'minimal' ? `3px solid ${primaryColor}` : 'none',
              boxShadow: `0 0 25px ${primaryColor}77`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Play size={getPlayPixelSize() * 0.45} fill="#ffffff" color="#ffffff" style={{ marginLeft: '4px' }} />
          </div>
        )}

        {/* Barra de Controles Customizada */}
        <div
          data-testid="styling-player-controls-bar"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)',
            padding: '0.75rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            transition: 'opacity 0.2s ease',
          }}
        >
          {/* Barra de Progresso (Segmentada por Capítulos se ativo, ou Contínua) */}
          {progressBar && (
            chapters?.enabled && chapters.items.length >= 2 ? (
              <div
                data-testid="styling-chapters-progress-bar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  width: '100%',
                  height: '6px',
                  cursor: 'pointer',
                  padding: '2px 0',
                }}
              >
                {[...chapters.items]
                  .sort((a, b) => a.seconds - b.seconds)
                  .map((chap, idx, arr) => {
                    const start = Math.max(0, chap.seconds)
                    const end = idx < arr.length - 1
                      ? Math.max(start + 1, arr[idx + 1].seconds)
                      : Math.max(start + 1, duration || 60)
                    const segDur = Math.max(0.1, end - start)
                    const segWidth = (segDur / (duration || 60)) * 100
                    let fillPct = 0
                    if (currentTime >= end) fillPct = 100
                    else if (currentTime > start) fillPct = ((currentTime - start) / segDur) * 100

                    return (
                      <div
                        key={chap.id || idx}
                        data-testid={`chapter-segment-${idx}`}
                        title={`${chap.title || `Capítulo ${idx + 1}`} (${chap.time})`}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = start
                            setCurrentTime(start)
                          }
                        }}
                        style={{
                          flex: `${segWidth} 0 0`,
                          height: '4px',
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          borderRadius: '2px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${fillPct}%`,
                            height: '100%',
                            backgroundColor: primaryColor,
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    )
                  })}
              </div>
            ) : (
              <input
                type="range"
                data-testid="styling-progress-bar"
                min="0"
                max={duration || 60}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  width: '100%',
                  height: '4px',
                  accentColor: primaryColor,
                  cursor: 'pointer',
                }}
              />
            )
          )}

          {/* Linha de Controles */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                data-testid="preview-control-play"
                onClick={togglePlay}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#ffffff" />}
              </button>

              {rewind10s && (
                <button
                  type="button"
                  data-testid="preview-control-rewind"
                  onClick={handleRewind10}
                  title="Voltar 10 segundos"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <RotateCcw size={15} />
                  <span>10s</span>
                </button>
              )}

              {forward10s && (
                <button
                  type="button"
                  data-testid="preview-control-forward"
                  onClick={handleForward10}
                  title="Avançar 10 segundos"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>10s</span>
                  <RotateCw size={15} />
                </button>
              )}

              {volume && (
                <VolumeControl
                  volume={volumeLevel}
                  isMuted={isMuted}
                  primaryColor={primaryColor}
                  onVolumeChange={handleVolumeChange}
                  onToggleMute={toggleMute}
                  testIdPrefix="preview"
                />
              )}

              {videoTime && (
                <span
                  data-testid="styling-video-time"
                  title="Tempo restante para acabar o vídeo"
                  style={{
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                    marginLeft: '0.35rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  -{formatTime(Math.max(0, (duration || 0) - currentTime))}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {speedControl && (
                <button
                  type="button"
                  data-testid="preview-control-speed"
                  onClick={cycleSpeed}
                  title="Alterar Velocidade"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#ffffff',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {currentSpeed.toFixed(2)}x
                </button>
              )}

              {fullscreen && (
                <button
                  type="button"
                  data-testid="preview-control-fullscreen"
                  onClick={toggleFullscreen}
                  title="Tela Cheia"
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px', display: 'flex' }}
                >
                  <Maximize size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
