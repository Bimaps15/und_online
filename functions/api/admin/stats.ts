import { json, type Env } from '../_shared'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const row = await env.DB.prepare(`SELECT COUNT(*) AS totalRsvp, SUM(attendance = 'hadir') AS attending, SUM(attendance = 'tidak_hadir') AS absent, SUM(attendance = 'belum_pasti') AS uncertain FROM rsvp`).first<Record<string, number>>()
    const wishes = await env.DB.prepare('SELECT COUNT(*) AS total FROM wishes').first<{ total: number }>()
    return json({ success: true, stats: { totalRsvp: row?.totalRsvp ?? 0, attending: row?.attending ?? 0, absent: row?.absent ?? 0, uncertain: row?.uncertain ?? 0, totalWishes: wishes?.total ?? 0 } })
  } catch { return json({ success: false, message: 'Statistik tidak tersedia' }, 500) }
}
