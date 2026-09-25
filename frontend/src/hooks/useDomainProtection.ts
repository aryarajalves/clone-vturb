import { useEffect, useState } from 'react'
import type { Video } from '../types/video'

export function useDomainProtection(video: Video | null) {
  const [domainBlocked, setDomainBlocked] = useState(false)

  useEffect(() => {
    if (!video) return
    const protection = video.player_settings?.domain_protection
    if (protection?.enabled && protection.allowed_domains && protection.allowed_domains.length > 0) {
      let host = ''
      try {
        if (document.referrer) {
          host = new URL(document.referrer).hostname.toLowerCase()
        } else {
          host = window.location.hostname.toLowerCase()
        }
      } catch {
        host = window.location.hostname.toLowerCase()
      }

      const isAllowed = protection.allowed_domains.some((d) => {
        const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
        if (!clean) return false
        return (
          clean === '*' ||
          host === clean ||
          host.endsWith('.' + clean) ||
          (clean === 'localhost' && (host === 'localhost' || host === '127.0.0.1'))
        )
      })

      setDomainBlocked(!isAllowed)
    } else {
      setDomainBlocked(false)
    }
  }, [video])

  return domainBlocked
}
