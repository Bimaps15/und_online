import { guestIdentityFromUrl, sanitizeGuestName } from '../../src/lib/guestIdentity'
import type { Env } from './_shared'

export async function resolveGuest(request: Request, env: Env) {
  const referrer = request.headers.get('Referer')
  if (!referrer) return null
  let link: URL
  try { link = new URL(referrer) } catch { return null }
  if (link.origin !== new URL(request.url).origin) return null
  const identity = guestIdentityFromUrl(link)
  if (!identity) return null
  const guest = await env.DB.prepare('SELECT guest_name FROM guests WHERE guest_slug = ? LIMIT 1')
    .bind(identity.slug).first<{ guest_name: string }>()
  const name = guest ? sanitizeGuestName(guest.guest_name) : identity.name
  return name ? { ...identity, name } : null
}
