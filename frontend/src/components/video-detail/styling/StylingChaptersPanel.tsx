import React from 'react'
import { Plus, Trash2, Bookmark } from 'lucide-react'
import type { ChapterItem, ChaptersSettings } from '../../../types/video'

interface StylingChaptersPanelProps {
  chapters: ChaptersSettings
  onChange: (updated: ChaptersSettings) => void
  videoDuration?: number
}

// Converte string "MM:SS" ou "HH:MM:SS" em segundos
export function timeStringToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':').map((p) => parseInt(p, 10) || 0)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return parts[0] || 0
}

// Converte segundos em formato "MM:SS"
export function secondsToTimeString(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const StylingChaptersPanel: React.FC<StylingChaptersPanelProps> = ({
  chapters,
  onChange,
  videoDuration = 60,
}) => {
  const { enabled, items } = chapters

  const handleToggleEnabled = () => {
    const nextEnabled = !enabled
    let nextItems = items
    if (nextEnabled && items.length === 0) {
      nextItems = [
        { id: 'chap-1', time: '00:00', seconds: 0, title: 'Introdução' },
        { id: 'chap-2', time: '00:30', seconds: 30, title: 'Conteúdo Principal' },
      ]
    }
    onChange({ enabled: nextEnabled, items: nextItems })
  }

  const handleAddChapter = () => {
    const lastItem = items[items.length - 1]
    const lastSec = lastItem ? lastItem.seconds : 0
    const nextSec = Math.min(lastSec + 30, videoDuration)
    const newItem: ChapterItem = {
      id: `chap-${Date.now()}`,
      time: secondsToTimeString(nextSec),
      seconds: nextSec,
      title: `Capítulo ${items.length + 1}`,
    }
    onChange({ enabled, items: [...items, newItem] })
  }

  const handleUpdateChapter = (index: number, field: 'time' | 'title', value: string) => {
    const updated = [...items]
    if (field === 'time') {
      updated[index] = {
        ...updated[index],
        time: value,
        seconds: timeStringToSeconds(value),
      }
    } else {
      updated[index] = {
        ...updated[index],
        title: value,
      }
    }
    onChange({ enabled, items: updated })
  }

  const handleRemoveChapter = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    onChange({ enabled, items: updated })
  }

  return (
    <div
      data-testid="styling-chapters-panel"
      style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '1.35rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Cabeçalho com Título, Badge "novo" e Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bookmark size={18} color="#38bdf8" />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f4f4f5' }}>
            Capítulos
          </h4>
          <span
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            novo
          </span>
        </div>

        {/* Switch Toggle */}
        <button
          type="button"
          data-testid="toggle-chapters-switch"
          onClick={handleToggleEnabled}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: enabled ? '#3b82f6' : '#3f3f46',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            padding: 0,
          }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: '3px',
              left: enabled ? '23px' : '3px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          />
        </button>
      </div>

      {/* Descrição */}
      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a1a1aa', lineHeight: 1.4 }}>
        Adicione marcadores de capítulos para ajudar os espectadores a navegar seu vídeo.
      </p>

      {/* Lista de Capítulos (se habilitado) */}
      {enabled && (
        <div
          data-testid="chapters-items-list"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
        >
          {items.map((chap, idx) => (
            <div
              key={chap.id || idx}
              data-testid={`chapter-row-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
              }}
            >
              {/* Input de Tempo (MM:SS) */}
              <input
                type="text"
                value={chap.time}
                data-testid={`chapter-time-${idx}`}
                placeholder="00:00"
                onChange={(e) => handleUpdateChapter(idx, 'time', e.target.value)}
                style={{
                  width: '68px',
                  padding: '0.55rem 0.4rem',
                  borderRadius: '8px',
                  backgroundColor: '#202024',
                  border: '1px solid #3f3f46',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />

              {/* Input de Título */}
              <input
                type="text"
                value={chap.title}
                data-testid={`chapter-title-${idx}`}
                placeholder="Nome do capítulo"
                onChange={(e) => handleUpdateChapter(idx, 'title', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#202024',
                  border: '1px solid #3f3f46',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />

              {/* Botão de Excluir */}
              <button
                type="button"
                data-testid={`chapter-delete-${idx}`}
                onClick={() => handleRemoveChapter(idx)}
                title="Excluir capítulo"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#71717a'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Botão Adicionar Capítulo */}
          <button
            type="button"
            data-testid="add-chapter-btn"
            onClick={handleAddChapter}
            style={{
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              width: '100%',
              padding: '0.65rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed #3f3f46',
              color: '#e4e4e7',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'
              e.currentTarget.style.borderColor = '#38bdf8'
              e.currentTarget.style.color = '#38bdf8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
              e.currentTarget.style.borderColor = '#3f3f46'
              e.currentTarget.style.color = '#e4e4e7'
            }}
          >
            <Plus size={16} />
            <span>Adicionar capítulo</span>
          </button>
        </div>
      )}
    </div>
  )
}
