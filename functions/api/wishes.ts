import { clean, hashIp, isRateLimited, json, verifyTurnstile, type Env } from './_shared'

type Payload = { name?: unknown; message?: unknown; turnstileToken?: unknown }
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try { const url = new URL(request.url); const page = Math.max(1, Number(url.searchParams.get('page')) || 1); const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20)); const result = await env.DB.prepare('SELECT id, guest_name, message, created_at FROM wishes WHERE approved = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, (page - 1) * limit).all(); return json({ success: true, wishes: result.results, page, limit }) } catch { return json({ success: false, wishes: [], message: 'Ucapan sementara tidak tersedia.' }, 500) }
}
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<Payload>(); const name = clean(body.name, 100); const message = clean(body.message, 500)
    if (!name) return json({ success: false, message: 'Nama wajib diisi' }, 400); if (!message) return json({ success: false, message: 'Ucapan wajib diisi' }, 400)
    if (!await verifyTurnstile(clean(body.turnstileToken, 2048), request, env)) return json({ success: false, message: 'Verifikasi keamanan gagal. Silakan coba lagi.' }, 403)
    const ipHash = await hashIp(request, env); if (await isRateLimited(env, 'wishes', ipHash)) return json({ success: false, message: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.' }, 429)
    const approved = env.MODERATE_WISHES === 'true' ? 0 : 1
    await env.DB.prepare('INSERT INTO wishes (guest_name, message, approved, ip_hash) VALUES (?, ?, ?, ?)').bind(name, message, approved, ipHash).run()
    return json({ success: true, message: approved ? 'Ucapan berhasil dikirim' : 'Ucapan terkirim dan menunggu persetujuan' })
  } catch { return json({ success: false, message: 'Maaf, ucapan sementara tidak tersedia.' }, 500) }
}
