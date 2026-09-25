export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export const isExpired = (expiresAt: string): boolean => {
  try {
    return new Date(expiresAt).getTime() < Date.now()
  } catch {
    return false
  }
}

export const getRoleBadge = (role: string) => {
  if (role === 'admin') {
    return {
      label: 'ADMIN',
      bg: '#e0f2fe',
      color: '#0284c7',
      border: '1px solid #bae6fd',
    }
  }
  return {
    label: 'USUÁRIO',
    bg: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
  }
}

export const getStatusBadge = (isUsed: boolean, expired: boolean) => {
  if (isUsed) {
    return {
      label: 'Utilizado',
      bg: '#f1f5f9',
      color: '#64748b',
    }
  }
  if (expired) {
    return {
      label: 'Expirado',
      bg: '#fee2e2',
      color: '#dc2626',
    }
  }
  return {
    label: 'Disponível',
    bg: '#dcfce7',
    color: '#15803d',
  }
}
