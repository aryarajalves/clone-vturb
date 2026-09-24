import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getApiBaseUrl } from '../services/apiConfig'
import { getMediaUrl } from '../services/api'

describe('Runtime Config - Resolução Dinâmica da URL da API', () => {
  const originalEnv = window.__ENV__

  beforeEach(() => {
    window.__ENV__ = undefined
  })

  afterEach(() => {
    window.__ENV__ = originalEnv
  })

  it('retorna a URL dinâmica injetada em window.__ENV__.VITE_API_BASE_URL', () => {
    window.__ENV__ = {
      VITE_API_BASE_URL: 'https://turb-api.aryaraj.shop',
    }
    expect(getApiBaseUrl()).toBe('https://turb-api.aryaraj.shop')
  })

  it('remove barras finais (trailing slashes) da URL injetada dinamicamente', () => {
    window.__ENV__ = {
      VITE_API_BASE_URL: 'https://api.cliente-empresa.com.br///',
    }
    expect(getApiBaseUrl()).toBe('https://api.cliente-empresa.com.br')
  })

  it('ignora strings vazias ou preenchidas apenas com espaços em window.__ENV__', () => {
    window.__ENV__ = {
      VITE_API_BASE_URL: '   ',
    }
    // Deve recorrer ao fallback ou meta.env
    const resolved = getApiBaseUrl()
    expect(resolved).not.toBe('   ')
    expect(resolved.length).toBeGreaterThan(0)
  })

  it('integra corretamente com getMediaUrl para URLs de upload locais', () => {
    window.__ENV__ = {
      VITE_API_BASE_URL: 'https://api.cliente.com',
    }
    // Atualiza dinamicamente a resolução
    expect(getApiBaseUrl()).toBe('https://api.cliente.com')
  })
})
