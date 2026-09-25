import { describe, it, expect } from 'vitest'
import { formatDate, isExpired, getRoleBadge, getStatusBadge } from '../components/users/inviteFormatters'

describe('inviteFormatters - Testes Unitários de Formatação de Convites', () => {
  it('formata datas em string legível pt-BR', () => {
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
    const formatted = formatDate('2026-09-25T15:00:00Z')
    expect(formatted).toBeTruthy()
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('verifica expiração de data corretamente', () => {
    // Data no passado deve ser expirada
    expect(isExpired('2020-01-01T00:00:00Z')).toBe(true)
    // Data no futuro não deve ser expirada
    expect(isExpired('2099-01-01T00:00:00Z')).toBe(false)
  })

  it('retorna badge correto para papéis de usuário (admin vs usuário)', () => {
    const adminBadge = getRoleBadge('admin')
    expect(adminBadge.label).toBe('ADMIN')
    expect(adminBadge.color).toBe('#0284c7')

    const userBadge = getRoleBadge('user')
    expect(userBadge.label).toBe('USUÁRIO')
    expect(userBadge.color).toBe('#475569')
  })

  it('retorna status correto para convites (utilizado, expirado, disponível)', () => {
    // Utilizado
    const usedStatus = getStatusBadge(true, false)
    expect(usedStatus.label).toBe('Utilizado')

    // Expirado (não utilizado)
    const expiredStatus = getStatusBadge(false, true)
    expect(expiredStatus.label).toBe('Expirado')

    // Disponível (não utilizado e não expirado)
    const availableStatus = getStatusBadge(false, false)
    expect(availableStatus.label).toBe('Disponível')
  })
})
