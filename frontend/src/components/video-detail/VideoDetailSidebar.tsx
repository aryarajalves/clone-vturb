import React from 'react'
import {
  Sliders,
  Code,
  BarChart3,
  Zap,
  VolumeX,
  Layers,
  Clock,
  Target,
  ShieldCheck,
} from 'lucide-react'
import type { Video } from '../../types/video'

export type ActiveTab =
  | 'settings'
  | 'embed'
  | 'metrics'
  | 'turbo'
  | 'smart_autoplay'
  | 'floating_player'
  | 'pitch_delay'
  | 'pixels'
  | 'security'

interface VideoDetailSidebarProps {
  video: Video
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
}

export const VideoDetailSidebar: React.FC<VideoDetailSidebarProps> = ({
  video,
  activeTab,
  onSelectTab,
}) => {
  const settings = video.player_settings || {}

  const navItems: {
    id: ActiveTab
    label: string
    icon: React.ReactNode
    activeColor: string
    activeBg: string
    badge?: { text: string; active: boolean }
  }[] = [
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Sliders size={18} />,
      activeColor: '#4338ca',
      activeBg: '#eef2ff',
    },
    {
      id: 'embed',
      label: 'Embedding',
      icon: <Code size={18} />,
      activeColor: '#4338ca',
      activeBg: '#eef2ff',
    },
    {
      id: 'metrics',
      label: 'Métricas',
      icon: <BarChart3 size={18} />,
      activeColor: '#4338ca',
      activeBg: '#eef2ff',
    },
    {
      id: 'turbo',
      label: 'Turbo',
      icon: <Zap size={18} />,
      activeColor: '#b45309',
      activeBg: '#fffbeb',
      badge: {
        text: settings.turbo_enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.turbo_enabled),
      },
    },
    {
      id: 'smart_autoplay',
      label: 'Smart Autoplay',
      icon: <VolumeX size={18} />,
      activeColor: '#dc2626',
      activeBg: '#fef2f2',
      badge: {
        text: settings.smart_autoplay?.enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.smart_autoplay?.enabled),
      },
    },
    {
      id: 'floating_player',
      label: 'Player Flutuante',
      icon: <Layers size={18} />,
      activeColor: '#2563eb',
      activeBg: '#eff6ff',
      badge: {
        text: settings.floating_player?.enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.floating_player?.enabled),
      },
    },
    {
      id: 'pitch_delay',
      label: 'Conteúdo Oculto',
      icon: <Clock size={18} />,
      activeColor: '#7c3aed',
      activeBg: '#f5f3ff',
      badge: {
        text: settings.pitch_delay?.enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.pitch_delay?.enabled),
      },
    },
    {
      id: 'pixels',
      label: 'Pixels & Rastreamento',
      icon: <Target size={18} />,
      activeColor: '#059669',
      activeBg: '#ecfdf5',
      badge: {
        text: settings.tracking_pixels?.enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.tracking_pixels?.enabled),
      },
    },
    {
      id: 'security',
      label: 'Segurança & Domínios',
      icon: <ShieldCheck size={18} />,
      activeColor: '#0891b2',
      activeBg: '#ecfeff',
      badge: {
        text: settings.domain_protection?.enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.domain_protection?.enabled),
      },
    },
  ]

  return (
    <aside
      data-testid="video-detail-sidebar"
      style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '1.25rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '0 0.75rem 0.65rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Gerenciamento
      </div>

      {navItems.map((item) => {
        const isActive = activeTab === item.id

        return (
          <button
            key={item.id}
            type="button"
            data-testid={`tab-btn-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: isActive ? item.activeBg : 'transparent',
              color: isActive ? item.activeColor : '#475569',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ color: isActive ? item.activeColor : '#64748b', display: 'flex' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                data-testid={`badge-${item.id}`}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '12px',
                  backgroundColor: item.badge.active ? '#dcfce7' : '#f1f5f9',
                  color: item.badge.active ? '#15803d' : '#94a3b8',
                  border: item.badge.active ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                }}
              >
                {item.badge.text}
              </span>
            )}
          </button>
        )
      })}
    </aside>
  )
}
