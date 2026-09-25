import { describe, it, expect, beforeEach } from 'vitest'
import {
  getOrCreateVisitorId,
  parseEmbedDimensions,
  computeEmbedContainerStyle,
} from './embedPlayerHelpers'

describe('embedPlayerHelpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getOrCreateVisitorId', () => {
    it('gera e persiste um novo visitorId no localStorage se não existir', () => {
      const id = getOrCreateVisitorId()
      expect(id).toMatch(/^vis_/)
      expect(localStorage.getItem('vturb_visitor_id')).toBe(id)
    })

    it('reaproveita o visitorId já existente no localStorage', () => {
      localStorage.setItem('vturb_visitor_id', 'vis_test_12345')
      const id = getOrCreateVisitorId()
      expect(id).toBe('vis_test_12345')
    })
  })

  describe('parseEmbedDimensions', () => {
    it('retorna formato padrão 16:9 quando nenhum parâmetro é passado', () => {
      const { effectiveRatio, isTransparent } = parseEmbedDimensions(null)
      expect(effectiveRatio).toBe('16:9')
      expect(isTransparent).toBe(true)
    })

    it('identifica proporção vertical 9:16 a partir de player_settings', () => {
      const mockVideo: any = {
        player_settings: { aspect_ratio: '9:16', transparent_background: false },
      }
      const { effectiveRatio, isTransparent } = parseEmbedDimensions(mockVideo)
      expect(effectiveRatio).toBe('9:16')
      expect(isTransparent).toBe(false)
    })
  })

  describe('computeEmbedContainerStyle', () => {
    it('aplica estilo de tela cheia (100vw, 100vh, fundo preto) quando isFullscreen é true', () => {
      const style = computeEmbedContainerStyle({
        isFloatingActive: false,
        isFullscreen: true,
        isTransparent: true,
        isVideoReady: true,
        effectiveRatio: '16:9',
        isInsideIframe: false,
      })

      expect(style.width).toBe('100vw')
      expect(style.height).toBe('100vh')
      expect(style.background).toBe('#000000')
      expect(style.borderRadius).toBe('0px')
    })

    it('aplica estilo fixo e miniatura quando isFloatingActive é true', () => {
      const style = computeEmbedContainerStyle({
        isFloatingActive: true,
        isFullscreen: false,
        isTransparent: false,
        isVideoReady: true,
        floatingConfig: { width: 320, position: 'bottom-right' },
        effectiveRatio: '16:9',
        isInsideIframe: false,
      })

      expect(style.position).toBe('fixed')
      expect(style.bottom).toBe('32px')
      expect(style.right).toBe('56px')
      expect(style.width).toBe('320px')
      expect(style.zIndex).toBe(9999)
    })
  })
})
