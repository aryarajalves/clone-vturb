import { describe, it, expect } from 'vitest'
import {
  formatTime,
  getTimeTicks,
  hourlyTicks,
  getRetentionValues,
  getInterpolatedRetention,
  getYCoordinate,
  generateRetentionPaths,
  generateHourlyPaths,
} from '../components/video-detail/metrics/retentionChartHelpers'
import type { VideoMetrics } from '../types/video'

describe('retentionChartHelpers - Testes Unitários dos Utilitários de Retenção', () => {
  it('formata segundos no padrão MM:SS com zero à esquerda', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(147)).toBe('02:27')
    expect(formatTime(600)).toBe('10:00')
  })

  it('calcula os marcadores do eixo X proporcionais à duração do vídeo', () => {
    const ticks = getTimeTicks(100)
    expect(ticks).toHaveLength(5)
    expect(ticks[0]).toBe('00:00')
    expect(ticks[4]).toBe('01:40')
  })

  it('possui marcadores horários estáticos de 24h corretos', () => {
    expect(hourlyTicks).toEqual(['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'])
  })

  it('calcula valores de retenção para cada marco (0, 25, 50, 75, 100%)', () => {
    const mockMetrics: VideoMetrics = {
      total_plays: 100,
      unique_plays: 80,
      impressions: 200,
      unique_impressions: 150,
      play_rate: 50,
      average_retention_seconds: 60,
      total_retention_percent: 45,
      ctr: 5.5,
      retention: {
        '25%': 80,
        '50%': 60,
        '75%': 40,
        '100%': 20,
      },
      hourly_distribution: [],
    }

    const retValues = getRetentionValues(mockMetrics, 100)
    expect(retValues[0]).toBe(100)
    expect(retValues[25]).toBe(80)
    expect(retValues[50]).toBe(60)
    expect(retValues[75]).toBe(40)
    expect(retValues[100]).toBe(20)
  })

  it('interpola retenção e audiência corretamente para qualquer porcentagem intermediária', () => {
    const retValues = {
      0: 100,
      25: 80,
      50: 60,
      75: 40,
      100: 20,
    }

    // Ponto exato de 25%
    const res25 = getInterpolatedRetention(25, retValues, 100, 100)
    expect(res25.retention).toBe(80)
    expect(res25.audience).toBe(80)

    // Ponto intermediário de 12.5% (metade entre 0% e 25%) => 100 - (100 - 80) * 0.5 = 90
    const resMid = getInterpolatedRetention(12.5, retValues, 100, 100)
    expect(resMid.retention).toBe(90)
    expect(resMid.audience).toBe(90)

    // Total de plays zerado
    const resZero = getInterpolatedRetention(50, retValues, 0, 0)
    expect(resZero.retention).toBe(0)
    expect(resZero.audience).toBe(0)
  })

  it('calcula a coordenada Y do SVG onde 100% = topo e 0% = base', () => {
    expect(getYCoordinate(100)).toBe(15) // Topo
    expect(getYCoordinate(0)).toBe(190) // Base
    expect(getYCoordinate(50)).toBe(102.5) // Centro
  })

  it('gera caminhos SVG de retenção e horários válidos', () => {
    const retValues = { 0: 100, 25: 75, 50: 50, 75: 25, 100: 0 }
    const { retentionPathD, retentionAreaD } = generateRetentionPaths(retValues)
    expect(retentionPathD).toContain('M 0,15')
    expect(retentionAreaD).toContain('L 1000,190 L 0,190 Z')

    const hourlyList = [
      { hour: 0, label: '00:00', impressions: 10, plays: 5 },
      { hour: 12, label: '12:00', impressions: 30, plays: 20 },
      { hour: 23, label: '23:00', impressions: 15, plays: 8 },
    ]
    const { hourlyPathD, hourlyAreaD } = generateHourlyPaths(hourlyList, 20)
    expect(hourlyPathD).toContain('M')
    expect(hourlyAreaD).toContain('L 1000,190 L 0,190 Z')
  })
})
