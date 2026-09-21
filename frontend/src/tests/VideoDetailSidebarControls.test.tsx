import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VideoDetailSidebar, type ActiveTab } from '../components/video-detail/VideoDetailSidebar'
import type { Video } from '../types/video'

const mockVideo: Video = {
  id: 'vid-test-controls-1',
  title: 'Vídeo Teste Controles',
  video_url: 'https://exemplo.com/video.mp4',
  thumbnail_url: 'https://exemplo.com/thumb.jpg',
  duration: 120,
  player_settings: {
    turbo_enabled: true,
    smart_autoplay: {
      enabled: true,
      text: 'Vídeo começou',
      subtext: 'Clique para áudio',
      button_color: '#ef4444',
      button_text: 'OUVIR',
      restart_on_unmute: false,
    },
    floating_player: {
      enabled: true,
      position: 'bottom-right',
      width: 320,
      closeable: true,
    },
    pitch_delay: {
      enabled: false,
      time: 60,
      target_css_selector: '.delay-pitch',
      auto_scroll: true,
      scroll_offset: 50,
      persistence: true,
    },
    tracking_pixels: {
      enabled: true,
    },
    domain_protection: {
      enabled: false,
      allowed_domains: [],
      anti_download: true,
    },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('VideoDetailSidebar - Grupo de Controles Expansível', () => {
  it('renderiza o botão Controles e o botão Estilização na barra lateral', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="settings"
        onSelectTab={onSelectTabMock}
      />
    )

    const stylingBtn = screen.getByTestId('tab-btn-styling')
    expect(stylingBtn).toBeInTheDocument()
    expect(stylingBtn).toHaveTextContent(/Estilização/i)

    fireEvent.click(stylingBtn)
    expect(onSelectTabMock).toHaveBeenCalledWith('styling')

    const controlsBtn = screen.getByTestId('tab-btn-controls')
    expect(controlsBtn).toBeInTheDocument()
    expect(controlsBtn).toHaveTextContent(/Controles/i)
  })

  it('inicia fechado quando a aba ativa for Configurações, ocultando os 4 botões', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="settings"
        onSelectTab={onSelectTabMock}
      />
    )

    expect(screen.queryByTestId('controls-submenu')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tab-btn-turbo')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tab-btn-smart_autoplay')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tab-btn-floating_player')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tab-btn-pitch_delay')).not.toBeInTheDocument()
  })

  it('ao clicar em Controles, abre o submenu exibindo Turbo, Smart Autoplay, Player Flutuante e Conteúdo Oculto', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="settings"
        onSelectTab={onSelectTabMock}
      />
    )

    const controlsBtn = screen.getByTestId('tab-btn-controls')
    fireEvent.click(controlsBtn)

    expect(screen.getByTestId('controls-submenu')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-turbo')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-smart_autoplay')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-floating_player')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-pitch_delay')).toBeInTheDocument()

    expect(screen.getByTestId('tab-btn-turbo')).toHaveTextContent('Turbo')
    expect(screen.getByTestId('tab-btn-smart_autoplay')).toHaveTextContent('Smart Autoplay')
    expect(screen.getByTestId('tab-btn-floating_player')).toHaveTextContent('Player Flutuante')
    expect(screen.getByTestId('tab-btn-pitch_delay')).toHaveTextContent('Conteúdo Oculto')
  })

  it('ao clicar novamente em Controles, fecha o submenu (toggle)', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="settings"
        onSelectTab={onSelectTabMock}
      />
    )

    const controlsBtn = screen.getByTestId('tab-btn-controls')
    // Abre
    fireEvent.click(controlsBtn)
    expect(screen.getByTestId('controls-submenu')).toBeInTheDocument()

    // Fecha
    fireEvent.click(controlsBtn)
    expect(screen.queryByTestId('controls-submenu')).not.toBeInTheDocument()
  })

  it('chama onSelectTab com o id correto ao clicar em cada um dos 4 botões de controle', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="settings"
        onSelectTab={onSelectTabMock}
      />
    )

    // Abre o grupo
    fireEvent.click(screen.getByTestId('tab-btn-controls'))

    // Clica em Turbo
    fireEvent.click(screen.getByTestId('tab-btn-turbo'))
    expect(onSelectTabMock).toHaveBeenCalledWith('turbo')

    // Clica em Smart Autoplay
    fireEvent.click(screen.getByTestId('tab-btn-smart_autoplay'))
    expect(onSelectTabMock).toHaveBeenCalledWith('smart_autoplay')

    // Clica em Player Flutuante
    fireEvent.click(screen.getByTestId('tab-btn-floating_player'))
    expect(onSelectTabMock).toHaveBeenCalledWith('floating_player')

    // Clica em Conteúdo Oculto
    fireEvent.click(screen.getByTestId('tab-btn-pitch_delay'))
    expect(onSelectTabMock).toHaveBeenCalledWith('pitch_delay')
  })

  it('exibe badges Ativo e Off fiéis ao estado do vídeo para os 4 botões', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="settings"
        onSelectTab={onSelectTabMock}
      />
    )

    // Abre o grupo
    fireEvent.click(screen.getByTestId('tab-btn-controls'))

    // Turbo ativo -> badge Ativo
    expect(screen.getByTestId('badge-turbo')).toHaveTextContent('Ativo')
    // Smart Autoplay ativo -> badge Ativo
    expect(screen.getByTestId('badge-smart_autoplay')).toHaveTextContent('Ativo')
    // Player Flutuante ativo -> badge Ativo
    expect(screen.getByTestId('badge-floating_player')).toHaveTextContent('Ativo')
    // Conteúdo Oculto desativado -> badge Off
    expect(screen.getByTestId('badge-pitch_delay')).toHaveTextContent('Off')
  })

  it('permanece automaticamente aberto e destacado quando uma aba de controle estiver ativa', () => {
    const onSelectTabMock = vi.fn()
    render(
      <VideoDetailSidebar
        video={mockVideo}
        activeTab="floating_player"
        onSelectTab={onSelectTabMock}
      />
    )

    // Como activeTab é floating_player, já deve iniciar aberto
    expect(screen.getByTestId('controls-submenu')).toBeInTheDocument()
    expect(screen.getByTestId('tab-btn-floating_player')).toBeInTheDocument()

    // O botão Controles pai reflete o estado ativo
    const controlsBtn = screen.getByTestId('tab-btn-controls')
    expect(controlsBtn).toHaveStyle({ color: 'rgb(67, 56, 202)' })
  })
})
