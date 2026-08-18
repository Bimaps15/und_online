export interface Env { DB: D1Database; TURNSTILE_SECRET_KEY?: string; IP_HASH_SALT?: string; MODERATE_WISHES?: string }
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
export const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) : ''
export async function verifyTurnstile(token: string, request: Request, env: Env) {
  if (!env.TURNSTILE_SECRET_KEY) return true
  if (!token) return false
  const form = new FormData(); form.set('secret', env.TURNSTILE_SECRET_KEY); form.set('response', token)
  const ip = request.headers.get('CF-Connecting-IP'); if (ip) form.set('remoteip', ip)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  const result = await response.json() as { success?: boolean }
  return result.success === true
}
export async function hashIp(request: Request, env: Env) {
  const source = `${request.headers.get('CF-Connecting-IP') ?? 'unknown'}:${env.IP_HASH_SALT ?? 'configure-production-salt'}`
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source))
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}
export async function isRateLimited(env: Env, table: 'rsvp' | 'wishes', ipHash: string) {
  const row = await env.DB.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ip_hash = ? AND created_at > datetime('now', '-30 seconds')`).bind(ipHash).first<{ count: number }>()
  return (row?.count ?? 0) > 0
}
