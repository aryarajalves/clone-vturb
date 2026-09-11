import React, { useState, useRef, useEffect } from 'react'
import { Zap, Play, Pause, RotateCcw, Save, Gauge, Check, Info, Volume2, VolumeX } from 'lucide-react'
import type { Video } from '../../types/video'
import { updateVideo, getMediaUrl } from '../../services/api'

interface VideoTurboTabProps {
  video: Video
  onSave: (updated: Video) => void
  showToast: (msg: string) => void
}

const SPEED_PRESETS = [
  { value: 0.5, label: '0.5x', desc: 'Mais devagar / Câmera lenta' },
  { value: 0.75, label: '0.75x', desc: 'Levemente lento' },
  { value: 1.0, label: '1.0x', desc: 'Velocidade normal' },
  { value: 1.25, label: '1.25x', desc: 'Acelerado leve' },
  { value: 1.5, label: '1.5x', desc: 'Turbo recomendado' },
  { value: 1.75, label: '1.75x', desc: 'Super Turbo' },
  { value: 2.0, label: '2.0x', desc: 'Ultra rápido (2x)' },
]

export const VideoTurboTab: React.FC<VideoTurboTabProps> = ({ video, onSave, showToast }) => {
  const initialSpeed = Number(video.player_settings?.playback_rate) || 1.0
  const initialEnabled = Boolean(video.player_settings?.turbo_enabled)
  const [enabled, setEnabled] = useState<boolean>(initialEnabled)
  const [speed, setSpeed] = useState<number>(initialSpeed)
  const [saving, setSaving] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Sincroniza a velocidade no elemento de vídeo da prévia em tempo real
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = enabled ? speed : 1.0
    }
  }, [speed, enabled])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleSelectPreset = (val: number) => {
    setSpeed(val)
    setEnabled(true)
  }

  const handleToggle = async (newVal: boolean) => {
    setEnabled(newVal)
    if (newVal && speed === 1.0) {
      setSpeed(1.25)
    }
    if (!newVal) {
      try {
        setSaving(true)
        const updatedSettings = {
          ...video.player_settings,
          playback_rate: 1.0,
          turbo_enabled: false,
        }
        const updated = await updateVideo(video.id, {
          player_settings: updatedSettings,
        })
        onSave(updated)
        showToast('Modo Turbo desativado com sucesso!')
      } catch {
        showToast('Erro ao desativar Modo Turbo.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleReset = async () => {
    setSpeed(1.0)
    await handleToggle(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updatedSettings = {
        ...video.player_settings,
        playback_rate: enabled ? speed : 1.0,
        turbo_enabled: enabled,
      }
      const updated = await updateVideo(video.id, {
        player_settings: updatedSettings,
      })
      onSave(updated)
      showToast(
        enabled
          ? `Modo Turbo ativado com velocidade de ${speed.toFixed(2)}x!`
          : 'Modo Turbo desativado (velocidade normal 1.00x).'
      )
    } catch {
      showToast('Erro ao salvar velocidade Turbo do vídeo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
      {/* Banner Principal Turbo com Switch de Ativação */}
      <div
        data-testid="turbo-banner"
        style={{ background: 'linear-gradient(135deg, #311042 0%, #1e1b4b 50%, #431407 100%)', borderRadius: '16px', padding: '1.75rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.25)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)', flexShrink: 0 }}>
            <Zap size={32} color="#ffffff" fill="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fcd34d', fontWeight: 700 }}>
              Mecanismo de Aceleração
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0', color: '#ffffff' }}>
              Modo Turbo do Vídeo
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1' }}>
              Configure a velocidade de reprodução entre <strong>0.5x</strong> (mais devagar) até <strong>2.0x</strong> (ultra-rápido).
            </p>
          </div>
        </div>

        {/* Lado Direito do Banner: Switch Ativar/Desativar + Badge de Velocidade Atual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Card Ativar Modo Turbo */}
          <div
            data-testid="turbo-status-container"
            style={{ background: enabled ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', border: enabled ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#fcd34d', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Ativar Modo Turbo
              </div>
              <div
                data-testid="turbo-status-text"
                style={{ fontSize: '0.9rem', fontWeight: 800, color: enabled ? '#4ade80' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: enabled ? '#4ade80' : '#94a3b8' }} />
                {enabled ? 'Ativado' : 'Desativado'}
              </div>
            </div>

            {/* Switch Toggle */}
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                data-testid="turbo-toggle"
                checked={enabled}
                onChange={(e) => handleToggle(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{ position: 'absolute', inset: 0, backgroundColor: enabled ? '#f59e0b' : 'rgba(255, 255, 255, 0.25)', borderRadius: '34px', transition: 'all 0.25s ease', boxShadow: enabled ? '0 0 10px rgba(245, 158, 11, 0.6)' : 'none' }}>
                <span style={{ position: 'absolute', height: '18px', width: '18px', left: enabled ? '28px' : '4px', bottom: '4px', backgroundColor: '#ffffff', borderRadius: '50%', transition: 'all 0.25s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }} />
              </span>
            </label>
          </div>

          {/* Badge de Velocidade Atual */}
          <div
            data-testid="turbo-speed-badge"
            style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '0.65rem 1.25rem', textAlign: 'right', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)', minWidth: '90px' }}
          >
            <div style={{ fontSize: '0.7rem', color: '#fcd34d', textTransform: 'uppercase', fontWeight: 600 }}>
              Velocidade Atual
            </div>
            <div data-testid="current-speed-display" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
              {speed.toFixed(2)}x
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Controles de Velocidade + Prévia do Player (Visível EXCLUSIVAMENTE quando Ativado) */}
      {enabled && (
        <div
          data-testid="turbo-content"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}
        >
          {/* Painel Esquerdo: Seletores de Velocidade */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gauge size={18} color="#f59e0b" />
                Predefinições Rápidas (0.5x até 2.0x)
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Selecione uma das velocidades recomendadas para aplicar automaticamente.
              </p>
            </div>

          {/* Botões de Predefinição */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
            {SPEED_PRESETS.map((preset) => {
              const isSelected = enabled && Math.abs(speed - preset.value) < 0.01
              return (
                <button
                  key={preset.value}
                  type="button"
                  data-testid={`preset-speed-${preset.value}`}
                  onClick={() => handleSelectPreset(preset.value)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                    background: isSelected ? '#fffbeb' : '#f8fafc',
                    color: isSelected ? '#b45309' : '#334155',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(245, 158, 11, 0.2)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {isSelected && <Check size={14} color="#b45309" />}
                    {preset.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? '#92400e' : '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
                    {preset.desc}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Slider de Precisão Contínua */}
          <div style={{ paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Ajuste Fino de Precisão:
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: enabled ? '#f59e0b' : '#94a3b8' }}>
                {enabled ? `${speed.toFixed(2)}x` : '1.00x (Desativado)'}
              </span>
            </div>

            <input
              type="range"
              data-testid="turbo-speed-slider"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => {
                setSpeed(parseFloat(e.target.value))
                setEnabled(true)
              }}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: '#f59e0b',
                height: '6px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              <span>0.5x (Mais devagar)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Ultra rápido)</span>
            </div>
          </div>

          {/* Dica de Conversão */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', display: 'flex', gap: '0.65rem' }}>
            <Info size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
              Vídeos em velocidade <strong>1.25x a 1.5x</strong> costumam reter até 30% mais espectadores com pressa em funis de vendas de alta escala.
            </span>
          </div>

          {/* Botão de Salvar e Restaurar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button
              type="button"
              data-testid="turbo-save-btn"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: enabled ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#64748b',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: enabled ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Save size={16} />
              {saving ? 'Salvando...' : enabled ? `Salvar Turbo (${speed.toFixed(2)}x)` : 'Salvar (Desativado)'}
            </button>

            <button
              type="button"
              data-testid="turbo-reset-btn"
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} />
              Desativar Turbo (1.0x)
            </button>
          </div>
        </div>

        {/* Painel Direito: Teste ao Vivo no Player */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div>
            <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
              Prévia e Teste em Tempo Real
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Dê play no vídeo abaixo para ouvir e assistir à alteração de velocidade instantaneamente.
            </p>
          </div>

          {/* Container do Player com Overlay de Velocidade */}
          <div
            style={{
              position: 'relative',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#0f172a',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <video
              ref={videoRef}
              data-testid="turbo-preview-video"
              src={getMediaUrl(video.video_url)}
              muted={isMuted}
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Badge Flutuante de Velocidade sobre o Vídeo */}
            <div
              data-testid="turbo-floating-speed"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: enabled ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                color: enabled ? '#fcd34d' : '#94a3b8',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: enabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Zap size={14} color={enabled ? '#f59e0b' : '#94a3b8'} fill={enabled ? '#f59e0b' : 'none'} />
              <span>{enabled ? `${speed.toFixed(2)}x` : 'Off'}</span>
            </div>

            {/* Botão Central de Play Grande se Pausado */}
            {!isPlaying && (
              <button
                type="button"
                data-testid="turbo-preview-play-btn"
                onClick={togglePlay}
                style={{
                  position: 'absolute',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.9)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)',
                }}
              >
                <Play size={28} fill="#ffffff" style={{ marginLeft: '4px' }} />
              </button>
            )}
          </div>

          {/* Controles da Prévia */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              data-testid="turbo-toggle-play-btn"
              onClick={togglePlay}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} fill="#334155" />}
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </button>

            <button
              type="button"
              data-testid="turbo-toggle-mute-btn"
              onClick={toggleMute}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {isMuted ? 'Com Som' : 'Mudo'}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
