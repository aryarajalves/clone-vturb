import { describe, it, expect } from 'vitest'
import { generateEmbedCode } from '../utils/embedScriptGenerator'
import type { Video } from '../types/video'

const mockVideoWithFloating: Video = {
  id: 'vid-floating-test',
  title: 'Vídeo com Player Flutuante',
  video_url: 'https://cdn.exemplo.com/video.mp4',
  duration: 120,
  player_settings: {
    primary_color: '#10b981',
    aspect_ratio: '9:16',
    border_radius: 16,
    floating_player: {
      enabled: true,
      position: 'bottom-right',
      width: 280,
      closeable: true,
    },
    pitch_delay: {
      enabled: true,
      time: 45,
      target_css_selector: '.btn-comprar',
    },
  },
}

describe('embedScriptGenerator and Floating Player Integration', () => {
  const paddingTopMap = {
    '16:9': '56.25%',
    '9:16': '177.77%',
  }

  it('gera código com id do wrapper, IntersectionObserver e postMessage para o player flutuante', () => {
    const code = generateEmbedCode({
      video: mockVideoWithFloating,
      embedUrl: 'https://app.vturb.com/?embed=vid-floating-test',
      embedType: 'iframe',
      resolvedWidth: '640px',
      resolvedHeight: null,
      heightPreset: '9:16',
      paddingTopMap,
    })

    // Deve conter wrapper com ID único do vídeo
    expect(code).toContain('id="vturb-wrapper-vid-floating-test"')
    // Deve conter escuta de VTURB_PLAY_STATE
    expect(code).toContain('VTURB_PLAY_STATE')
    // Deve conter configuração ativa do player flutuante
    expect(code).toContain('var isFloatingConfig = true;')
    expect(code).toContain("var floatingPos = 'bottom-right';")
    expect(code).toContain('var floatingWidth = 280;')
    // Deve conter botão de fechar flutuante
    expect(code).toContain("'vturb-close-floating-' + videoId")
    // Deve conter o observer de visibilidade
    expect(code).toContain('IntersectionObserver')
    expect(code).toContain('updateFloatingState()')
    // Deve resetar top para auto e aplicar bottom: 24px para evitar ficar preso no topo
    expect(code).toContain("ifr.style.top = 'auto';")
    expect(code).toContain("ifr.style.bottom = '24px';")
  })

  it('respeita configuração quando o player flutuante está desativado', () => {
    const videoDisabled = {
      ...mockVideoWithFloating,
      player_settings: {
        ...mockVideoWithFloating.player_settings,
        floating_player: {
          enabled: false,
          position: 'bottom-left' as const,
          width: 320,
          closeable: true,
        },
      },
    }

    const code = generateEmbedCode({
      video: videoDisabled,
      embedUrl: 'https://app.vturb.com/?embed=vid-floating-test',
      embedType: 'iframe',
      resolvedWidth: '640px',
      resolvedHeight: null,
      heightPreset: '16:9',
      paddingTopMap,
    })

    expect(code).toContain('var isFloatingConfig = false;')
  })
})
