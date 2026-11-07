export type GuestIdentity = { name: string; slug: string }
const reservedPaths = new Set(['admin', 'api', 'assets', 'images', 'music', 'video', 'fonts', 'icons', 'seserahan', 'budget'])
export const personalLinkMessage = 'Silakan buka undangan melalui link pribadi Anda'
export function sanitizeGuestName(value: string) {
  return value.replace(/[<>\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100)
}
export function guestIdentityFromUrl(url: URL): GuestIdentity | null {
  const queryName = sanitizeGuestName(url.searchParams.get('to') ?? '')
  if (/\p{L}/u.test(queryName)) return { name: queryName, slug: queryName.toLocaleLowerCase('id-ID').replace(/[\s_]+/g, '-') }
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return null
  try {
    const slug = decodeURIComponent(segments[0]).toLocaleLowerCase('id-ID')
    if (reservedPaths.has(slug) || !/^[\p{L}\p{N}\s_.'’-]+$/u.test(slug) || !/\p{L}/u.test(slug) || slug.length > 100) return null
    const name = sanitizeGuestName(slug.replace(/[-_]+/g, ' ')).replace(/(^|[\s.'’])\p{L}/gu, letter => letter.toLocaleUpperCase('id-ID'))
    return { name, slug }
  } catch { return null }
}
