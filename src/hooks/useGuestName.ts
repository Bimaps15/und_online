import { useMemo } from 'react'

const reservedPaths = new Set(['admin', 'api', 'assets', 'images', 'music', 'fonts', 'icons'])

function sanitizeGuestName(value: string) {
  return value.replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100)
}

function guestNameFromPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 1 || reservedPaths.has(segments[0].toLowerCase())) return ''

  try {
    const decodedSlug = decodeURIComponent(segments[0]).replace(/[-_]+/g, ' ')
    const sanitizedName = sanitizeGuestName(decodedSlug)
    return sanitizedName.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('id-ID'))
  } catch {
    return ''
  }
}

export function useGuestName() {
  return useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get('to')
    const queryGuestName = raw ? sanitizeGuestName(raw) : ''
    if (queryGuestName) return queryGuestName

    return guestNameFromPath(window.location.pathname) || 'Tamu Undangan'
  }, [])
}