import { describe, it, expect } from 'vitest'
import { resolveWidth, resolveHeight, buildEmbedUrls, paddingTopMap } from '../components/video-detail/embed/embedDimensionHelpers'

describe('embedDimensionHelpers - Testes Unitários de Dimensões e URLs de Embed', () => {
  it('resolve largura corretamente para presets fixos, 100% e customizados', () => {
    expect(resolveWidth('640', '640')).toBe('640px')
    expect(resolveWidth('800', '800')).toBe('800px')
    expect(resolveWidth('100%', '100%')).toBe('100%')
    expect(resolveWidth('custom', '550px')).toBe('550px')
    expect(resolveWidth('custom', '75%')).toBe('75%')
    expect(resolveWidth('custom', '500')).toBe('500px') // Adiciona 'px' se omitido
  })

  it('resolve altura fixa somente quando heightPreset for custom', () => {
    expect(resolveHeight('16:9', '360')).toBeNull()
    expect(resolveHeight('9:16', '640')).toBeNull()
    expect(resolveHeight('custom', '450px')).toBe('450px')
    expect(resolveHeight('custom', '60vh')).toBe('60vh')
    expect(resolveHeight('custom', '400')).toBe('400px') // Adiciona 'px' se omitido
  })

  it('constrói corretamente URLs de embed e página de teste com parâmetros sincronizados', () => {
    const { embedUrl, previewTestUrl } = buildEmbedUrls('vid-test-123', '16:9', '640px', null, true)
    
    expect(embedUrl).toContain('embed=vid-test-123')
    expect(embedUrl).toContain('ratio=16:9')
    expect(embedUrl).toContain('width=640px')
    expect(embedUrl).toContain('transparent=1')

    expect(previewTestUrl).toContain('preview=vid-test-123')
    expect(previewTestUrl).toContain('ratio=16:9')
  })

  it('inclui parâmetro height na URL se altura for customizada', () => {
    const { embedUrl } = buildEmbedUrls('vid-test-123', 'custom', '800px', '450px', false)
    expect(embedUrl).toContain('ratio=custom')
    expect(embedUrl).toContain('height=450px')
    expect(embedUrl).toContain('transparent=0')
  })

  it('possui proporções corretas de paddingTop no paddingTopMap', () => {
    expect(paddingTopMap['16:9']).toBe('56.25%')
    expect(paddingTopMap['9:16']).toBe('177.77%')
    expect(paddingTopMap['4:3']).toBe('75%')
  })
})
