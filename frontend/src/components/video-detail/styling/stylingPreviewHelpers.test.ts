import { describe, it, expect } from 'vitest'
import { formatTime, getButtonRadius, getPlayPixelSize } from './stylingPreviewHelpers'

describe('stylingPreviewHelpers', () => {
  it('formata segundos para MM:SS corretamente', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(9)).toBe('00:09')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(3600)).toBe('60:00')
  })

  it('retorna o border-radius correto de acordo com a forma do botão', () => {
    expect(getButtonRadius('circle')).toBe('50%')
    expect(getButtonRadius('minimal')).toBe('50%')
    expect(getButtonRadius('rounded')).toBe('18px')
    expect(getButtonRadius('square')).toBe('8px')
  })

  it('retorna o tamanho em pixels correspondente ao porte do botão de play', () => {
    expect(getPlayPixelSize('small')).toBe(56)
    expect(getPlayPixelSize('medium')).toBe(76)
    expect(getPlayPixelSize('large')).toBe(96)
  })
})
