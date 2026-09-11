import React, { useState } from 'react'
import { Clock, Eye, Copy, Check } from 'lucide-react'
import type { Video, PitchDelaySettings } from '../../types/video'
import { updateVideo } from '../../services/api'

interface VideoPitchDelayTabProps {
  video: Video
  onSave: (updated: Video) => void
  showToast: (msg: string) => void
}

export const VideoPitchDelayTab: React.FC<VideoPitchDelayTabProps> = ({
  video,
  onSave,
  showToast,
}) => {
  const current = video.player_settings?.pitch_delay || {
    enabled: false,
    time: 60,
    target_css_selector: '.delay-pitch, #oferta-pitch',
    auto_scroll: true,
    scroll_offset: 50,
    persistence: true,
  }

  const [enabled, setEnabled] = useState(Boolean(current.enabled))
  const [time, setTime] = useState(current.time || 60)
  const [targetCss, setTargetCss] = useState(current.target_css_selector || '.delay-pitch, #oferta-pitch')
  const [autoScroll, setAutoScroll] = useState(current.auto_scroll ?? true)
  const [persistence, setPersistence] = useState(current.persistence ?? true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggle = async (newVal: boolean) => {
    setEnabled(newVal)
    if (!newVal) {
      try {
        setSaving(true)
        const pitchData: PitchDelaySettings = {
          enabled: false,
          time: Number(time) || 0,
          target_css_selector: targetCss,
          auto_scroll: autoScroll,
          scroll_offset: 50,
          persistence,
        }
        const updatedSettings = {
          ...video.player_settings,
          pitch_delay: pitchData,
        }
        const updated = await updateVideo(video.id, { player_settings: updatedSettings })
        onSave(updated)
        showToast('Conteúdo Oculto desativado com sucesso!')
      } catch {
        showToast('Erro ao desativar Conteúdo Oculto.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const pitchData: PitchDelaySettings = {
        enabled,
        time: Number(time) || 0,
        target_css_selector: targetCss,
        auto_scroll: autoScroll,
        scroll_offset: 50,
        persistence,
      }

      const updatedSettings = {
        ...video.player_settings,
        pitch_delay: pitchData,
      }

      const updated = await updateVideo(video.id, { player_settings: updatedSettings })
      onSave(updated)
      showToast(
        enabled
          ? 'Conteúdo Oculto (Pitch Delay) ativado e salvo!'
          : 'Conteúdo Oculto desativado com sucesso!'
      )
    } catch {
      showToast('Erro ao salvar configurações do Conteúdo Oculto.')
    } finally {
      setSaving(false)
    }
  }

  const exampleCssSnippet = `<!-- Adicione a classe "${targetCss.split(',')[0].replace('.', '')}" nos elementos da sua página que devem ficar ocultos até o pitch -->
<style>
  ${targetCss} {
    display: none;
  }
</style>`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exampleCssSnippet)
    setCopied(true)
    showToast('Código de estilo copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div data-testid="pitch-delay-tab" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Banner de Ativação */}
      <div
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(109, 40, 217, 0.05))'
            : '#ffffff',
          border: enabled ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: enabled ? '#ede9fe' : '#f1f5f9',
              color: enabled ? '#7c3aed' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b' }}>
              Mostrar Conteúdo Oculto (Pitch Delay)
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Libera seções da sua página externa (preços, checkout, depoimentos) exatamente no momento do pitch de venda.
            </p>
          </div>
        </div>

        {/* Switch */}
        <label
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '56px',
            height: '30px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            data-testid="pitch-delay-toggle"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: enabled ? '#7c3aed' : '#cbd5e1',
              borderRadius: '34px',
              transition: 'all 0.25s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                height: '22px',
                width: '22px',
                left: enabled ? '30px' : '4px',
                bottom: '4px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </span>
        </label>
      </div>

      {/* Formulário (Visível EXCLUSIVAMENTE quando Ativado) */}
      {enabled && (
        <div
          data-testid="pitch-delay-content"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Configurações de Tempo e Seletor */}
          <div>
            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
              Momento do Pitch e Elementos
            </h4>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Tempo para Exibir a Oferta (em segundos)
                </label>
                <span style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700 }}>
                  {time}s ({formatSeconds(time)})
                </span>
              </div>
              <input
                type="number"
                data-testid="pitch-delay-time-input"
                disabled={!enabled}
                min={1}
                value={time}
                onChange={(e) => setTime(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Seletor CSS dos Elementos na Página
              </label>
              <input
                type="text"
                data-testid="pitch-delay-selector-input"
                disabled={!enabled}
                value={targetCss}
                onChange={(e) => setTargetCss(e.target.value)}
                placeholder=".delay-pitch, #oferta"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Exemplo: .delay-pitch ou #secao-oferta
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="autoscroll-checkbox"
                  data-testid="pitch-delay-autoscroll"
                  disabled={!enabled}
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="autoscroll-checkbox" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                  Rolar a página automaticamente até a oferta quando liberada
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="persistence-checkbox"
                  data-testid="pitch-delay-persistence"
                  disabled={!enabled}
                  checked={persistence}
                  onChange={(e) => setPersistence(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="persistence-checkbox" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                  Lembrar do visitante (não esconder novamente em recargas de página)
                </label>
              </div>
            </div>
          </div>

          {/* Código & Instruções */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
                Como Usar na sua Página
              </h4>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#7c3aed',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar CSS'}
              </button>
            </div>

            <pre
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                lineHeight: '1.4',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {exampleCssSnippet}
            </pre>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', lineHeight: '1.5' }}>
              Cole esse CSS na sua página externa (ex: Elementor ou bloco HTML). Quando o vídeo atingir {time} segundos, o player automaticamente tornará visíveis todos os elementos com a classe configurada.
            </p>
          </div>
        </div>

        {/* Botão Salvar */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            data-testid="pitch-delay-save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
