/**
 * Serviço central de resolução da URL da API Backend.
 * Suporta injeção dinâmica em tempo de execução (Runtime Config para Docker/Swarm)
 * e fallback estático para desenvolvimento Vite.
 */

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string
    }
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const winEnv = window.__ENV__
    if (winEnv?.VITE_API_BASE_URL && winEnv.VITE_API_BASE_URL.trim() !== '') {
      return winEnv.VITE_API_BASE_URL.trim().replace(/\/+$/, '')
    }
  }

  const metaEnv = import.meta.env.VITE_API_BASE_URL
  if (metaEnv && metaEnv.trim() !== '') {
    return metaEnv.trim().replace(/\/+$/, '')
  }

  return 'http://localhost:8003'
}

export const API_BASE = getApiBaseUrl()
