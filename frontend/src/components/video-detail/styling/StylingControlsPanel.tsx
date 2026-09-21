import React, { useState } from 'react'
import { Check, Volume2, Maximize, Gauge, Clock, Info } from 'lucide-react'

interface StylingControlsPanelProps {
  borderRadius: number
  setBorderRadius: React.Dispatch<React.SetStateAction<number>>
  progressBar: boolean
  setProgressBar: React.Dispatch<React.SetStateAction<boolean>>
  videoTime: boolean
  setVideoTime: React.Dispatch<React.SetStateAction<boolean>>
  rewind10s: boolean
  setRewind10s: React.Dispatch<React.SetStateAction<boolean>>
  forward10s: boolean
  setForward10s: React.Dispatch<React.SetStateAction<boolean>>
  volume: boolean
  setVolume: React.Dispatch<React.SetStateAction<boolean>>
  fullscreen: boolean
  setFullscreen: React.Dispatch<React.SetStateAction<boolean>>
  speedControl: boolean
  setSpeedControl: React.Dispatch<React.SetStateAction<boolean>>
}

export const StylingControlsPanel: React.FC<StylingControlsPanelProps> = ({
  borderRadius,
  setBorderRadius,
  progressBar,
  setProgressBar,
  videoTime,
  setVideoTime,
  rewind10s,
  setRewind10s,
  forward10s,
  setForward10s,
  volume,
  setVolume,
  fullscreen,
  setFullscreen,
  speedControl,
  setSpeedControl,
}) => {
  const [hoveredControl, setHoveredControl] = useState<string | null>(null)

  const controlOptions = [
    {
      id: 'progress_bar',
      label: 'Barra de progresso',
      description: 'Exibe a linha do tempo do vídeo na barra de controles, permitindo que o visitante veja o progresso e navegue pelos capítulos.',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="5" x2="4" y2="19" />
          <line x1="20" y1="5" x2="20" y2="19" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <polyline points="10 9 7 12 10 15" />
          <polyline points="14 9 17 12 14 15" />
        </svg>
      ),
      checked: progressBar,
      toggle: () => setProgressBar((prev) => !prev),
      testId: 'toggle-control-progress',
    },
    {
      id: 'video_time',
      label: 'Tempo do Vídeo',
      description: 'Exibe o tempo restante em contagem regressiva para acabar o vídeo, mantendo o espectador ciente da duração.',
      icon: <Clock size={18} />,
      checked: videoTime,
      toggle: () => setVideoTime((prev) => !prev),
      testId: 'toggle-control-time',
    },
    {
      id: 'rewind_10s',
      label: 'Voltar 10s',
      description: 'Adiciona o botão para o visitante voltar 10 segundos no vídeo com um clique caso queira rever uma parte.',
      icon: (
        <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
          ◀◀
        </span>
      ),
      checked: rewind10s,
      toggle: () => setRewind10s((prev) => !prev),
      testId: 'toggle-control-rewind',
    },
    {
      id: 'forward_10s',
      label: 'Avançar 10s',
      description: 'Adiciona o botão para o visitante adiantar 10 segundos no vídeo durante a reprodução.',
      icon: (
        <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
          ▶▶
        </span>
      ),
      checked: forward10s,
      toggle: () => setForward10s((prev) => !prev),
      testId: 'toggle-control-forward',
    },
    {
      id: 'volume',
      label: 'Volume',
      description: 'Exibe o controle e ícone de volume na barra, permitindo que o visitante ajuste a altura ou ative/desative o áudio.',
      icon: <Volume2 size={18} />,
      checked: volume,
      toggle: () => setVolume((prev) => !prev),
      testId: 'toggle-control-volume',
    },
    {
      id: 'fullscreen',
      label: 'Fullscreen',
      description: 'Permite ao visitante expandir o player de vídeo para tela inteira no computador ou no celular.',
      icon: <Maximize size={18} />,
      checked: fullscreen,
      toggle: () => setFullscreen((prev) => !prev),
      testId: 'toggle-control-fullscreen',
    },
    {
      id: 'speed_control',
      label: 'Controle de velocidade',
      description: 'Disponibiliza um seletor no player para o espectador escolher a velocidade da reprodução (0.5x, 1x, 1.25x, 1.5x, 2x).',
      icon: <Gauge size={18} />,
      checked: speedControl,
      toggle: () => setSpeedControl((prev) => !prev),
      testId: 'toggle-control-speed',
    },
  ]

  return (
    <div
      style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '1.35rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      {/* Seção Cantos Arredondados */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="border-radius-slider"
          style={{
            display: 'block',
            fontSize: '0.98rem',
            fontWeight: 700,
            color: '#f4f4f5',
            marginBottom: '0.8rem',
            letterSpacing: '-0.01em',
          }}
        >
          Cantos Arredondados
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <input
            id="border-radius-slider"
            type="range"
            min={0}
            max={20}
            step={1}
            value={borderRadius}
            onChange={(e) => setBorderRadius(Number(e.target.value))}
            data-testid="styling-border-radius-slider"
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              accentColor: '#38bdf8',
              cursor: 'pointer',
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${(borderRadius / 20) * 100}%, #3f3f46 ${(borderRadius / 20) * 100}%, #3f3f46 100%)`,
            }}
          />
          <div
            data-testid="styling-border-radius-value"
            style={{
              width: '42px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {borderRadius}
          </div>
        </div>

        {/* Linha Divisória */}
        <div style={{ height: '1px', backgroundColor: '#27272a', marginTop: '1.25rem' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#f4f4f5' }}>
          Controles Visuais do Player
        </h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa' }}>
          Marque as opções que devem aparecer na barra de controles do vídeo.
        </p>
      </div>

      <div
        data-testid="styling-controls-options-list"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
      >
        {controlOptions.map((opt) => (
          <div
            key={opt.id}
            data-testid={opt.testId}
            title={opt.description}
            onClick={opt.toggle}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#202024',
              border: opt.checked ? '1px solid #3b82f644' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a'
              setHoveredControl(opt.id)
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#202024'
              setHoveredControl(null)
            }}
          >
            {/* Lado Esquerdo: Ícone + Rótulo + Ícone de Ajuda/Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ color: '#e4e4e7', display: 'flex', alignItems: 'center', width: '22px' }}>
                {opt.icon}
              </span>
              <span style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 600 }}>
                {opt.label}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: hoveredControl === opt.id ? '#38bdf8' : '#71717a',
                  transition: 'color 0.15s ease',
                }}
              >
                <Info size={14} />
              </span>
            </div>

            {/* Lado Direito: Checkbox azul estilizado idêntico ao print */}
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                backgroundColor: opt.checked ? '#3b82f6' : '#27272a',
                border: opt.checked ? '1px solid #3b82f6' : '1px solid #52525b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.checked && <Check size={16} color="#ffffff" strokeWidth={3} />}
            </div>

            {/* Tooltip Explicativo com Design Glassmorphism / Neon */}
            {hoveredControl === opt.id && (
              <div
                role="tooltip"
                data-testid={`tooltip-control-${opt.id}`}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(15, 15, 20, 0.98)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.75), 0 0 16px rgba(56, 189, 248, 0.15)',
                  zIndex: 60,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                  <Info size={14} color="#38bdf8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                    {opt.label}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#e4e4e7', lineHeight: '1.38' }}>
                  {opt.description}
                </div>
                {/* Indicador triangular apontando para baixo */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '26px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#0f0f14',
                    borderRight: '1px solid rgba(56, 189, 248, 0.45)',
                    borderBottom: '1px solid rgba(56, 189, 248, 0.45)',
                    transform: 'rotate(45deg)',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
