import React, { useState, useEffect } from 'react'
import {
  Sliders,
  Palette,
  Code,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  Zap,
  VolumeX,
  Volume2,
  Layers,
  Clock,
  Target,
  ShieldCheck,
} from 'lucide-react'
import type { Video } from '../../types/video'

export type ActiveTab =
  | 'settings'
  | 'styling'
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

interface NavItem {
  id: ActiveTab
  label: string
  icon: React.ReactNode
  activeColor: string
  activeBg: string
  badge?: { text: string; active: boolean }
}

const CONTROL_TAB_IDS: ActiveTab[] = [
  'turbo',
  'smart_autoplay',
  'floating_player',
  'pitch_delay',
]

export const VideoDetailSidebar: React.FC<VideoDetailSidebarProps> = ({
  video,
  activeTab,
  onSelectTab,
}) => {
  const settings = video.player_settings || {}
  const isAnyControlActive = CONTROL_TAB_IDS.includes(activeTab)

  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(() => isAnyControlActive)

  useEffect(() => {
    if (isAnyControlActive) {
      setIsControlsOpen(true)
    }
  }, [isAnyControlActive])

  const topItems: NavItem[] = [
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Sliders size={18} />,
      activeColor: '#4338ca',
      activeBg: '#eef2ff',
    },
    {
      id: 'styling',
      label: 'Estilização',
      icon: <Palette size={18} />,
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
  ]

  const controlItems: NavItem[] = [
    {
      id: 'turbo',
      label: 'Turbo',
      icon: <Zap size={17} />,
      activeColor: '#b45309',
      activeBg: '#fffbeb',
      badge: {
        text: settings.turbo_enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.turbo_enabled),
      },
    },
    {
      id: 'smart_autoplay',
      label: settings.smart_autoplay?.enabled && settings.smart_autoplay?.mode === 'direct'
        ? 'Autoplay Direto'
        : 'Smart Autoplay',
      icon: settings.smart_autoplay?.enabled && settings.smart_autoplay?.mode === 'direct'
        ? <Volume2 size={17} />
        : <VolumeX size={17} />,
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
      icon: <Layers size={17} />,
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
      icon: <Clock size={17} />,
      activeColor: '#7c3aed',
      activeBg: '#f5f3ff',
      badge: {
        text: settings.pitch_delay?.enabled ? 'Ativo' : 'Off',
        active: Boolean(settings.pitch_delay?.enabled),
      },
    },
  ]

  const bottomItems: NavItem[] = [
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

  const renderItemButton = (item: NavItem, isSubItem = false) => {
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
          padding: isSubItem ? '0.62rem 0.75rem' : '0.7rem 0.85rem',
          borderRadius: '8px',
          border: 'none',
          background: isActive ? item.activeBg : 'transparent',
          color: isActive ? item.activeColor : '#475569',
          fontWeight: isActive ? 700 : 500,
          fontSize: isSubItem ? '0.84rem' : '0.875rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: isSubItem ? '0.6rem' : '0.7rem' }}>
          <span style={{ color: isActive ? item.activeColor : '#64748b', display: 'flex' }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </div>

        {item.badge && (
          <span
            data-testid={`badge-${item.id}`}
            style={{
              fontSize: isSubItem ? '0.68rem' : '0.7rem',
              fontWeight: 700,
              padding: isSubItem ? '0.12rem 0.42rem' : '0.15rem 0.45rem',
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
  }

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

      {/* Itens Superiores: Configurações, Embedding, Métricas */}
      {topItems.map((item) => renderItemButton(item, false))}

      {/* Botão Grupo: Controles (Acordeão Colapsável) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          type="button"
          data-testid="tab-btn-controls"
          onClick={() => setIsControlsOpen((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.7rem 0.85rem',
            borderRadius: '8px',
            border: 'none',
            background: isAnyControlActive ? '#eef2ff' : isControlsOpen ? '#f8fafc' : 'transparent',
            color: isAnyControlActive ? '#4338ca' : '#475569',
            fontWeight: isAnyControlActive ? 700 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isAnyControlActive) e.currentTarget.style.backgroundColor = '#f8fafc'
          }}
          onMouseLeave={(e) => {
            if (!isAnyControlActive) {
              e.currentTarget.style.backgroundColor = isControlsOpen ? '#f8fafc' : 'transparent'
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <span style={{ color: isAnyControlActive ? '#4338ca' : '#64748b', display: 'flex' }}>
              <SlidersHorizontal size={18} />
            </span>
            <span>Controles</span>
          </div>

          <span
            data-testid="controls-chevron"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: isAnyControlActive ? '#4338ca' : '#94a3b8',
              transform: isControlsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ChevronDown size={16} />
          </span>
        </button>

        {/* Sub-menu expansível com os 4 botões de controles */}
        {isControlsOpen && (
          <div
            data-testid="controls-submenu"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              paddingLeft: '0.65rem',
              marginLeft: '0.85rem',
              borderLeft: '2px solid #e2e8f0',
              marginTop: '0.2rem',
              marginBottom: '0.25rem',
            }}
          >
            {controlItems.map((item) => renderItemButton(item, true))}
          </div>
        )}
      </div>

      {/* Itens Inferiores: Pixels & Rastreamento, Segurança & Domínios */}
      {bottomItems.map((item) => renderItemButton(item, false))}
    </aside>
  )
}
