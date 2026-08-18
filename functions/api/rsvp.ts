import { clean, hashIp, isRateLimited, json, verifyTurnstile, type Env } from './_shared'

type Payload = { name?: unknown; attendance?: unknown; guestCount?: unknown; message?: unknown; turnstileToken?: unknown }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<Payload>(); const name = clean(body.name, 100); const attendance = clean(body.attendance, 20); const message = clean(body.message, 500); const guestCount = Number(body.guestCount)
    if (!name) return json({ success: false, message: 'Nama wajib diisi' }, 400)
    if (!['hadir', 'tidak_hadir', 'belum_pasti'].includes(attendance)) return json({ success: false, message: 'Status kehadiran tidak valid' }, 400)
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 4) return json({ success: false, message: 'Jumlah tamu tidak valid' }, 400)
    if (!await verifyTurnstile(clean(body.turnstileToken, 2048), request, env)) return json({ success: false, message: 'Verifikasi keamanan gagal. Silakan coba lagi.' }, 403)
    const ipHash = await hashIp(request, env); if (await isRateLimited(env, 'rsvp', ipHash)) return json({ success: false, message: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.' }, 429)
    await env.DB.prepare('INSERT INTO rsvp (guest_name, attendance, guest_count, message, ip_hash) VALUES (?, ?, ?, ?, ?)').bind(name, attendance, guestCount, message || null, ipHash).run()
    return json({ success: true, message: 'Konfirmasi berhasil dikirim' })
  } catch { return json({ success: false, message: 'Maaf, konfirmasi sementara tidak tersedia.' }, 500) }
}
