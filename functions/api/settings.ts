import { json, type Env } from './_shared'

const DEFAULT_ADMIN_HASH = '4adcf56ae6660c996262fe5defa41cfd2d09cf42cec295d2504b23bd3bb1e807'

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function ensureTable(env: Env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS wedding_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      config_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run()
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    await ensureTable(env)
    const row = await env.DB.prepare(
      'SELECT config_json, updated_at FROM wedding_settings WHERE id = 1'
    ).first<{ config_json: string; updated_at: string }>()

    if (!row) {
      return json({ success: true, config: null, updatedAt: null })
    }

    return json({
      success: true,
      config: JSON.parse(row.config_json),
      updatedAt: row.updated_at,
    })
  } catch {
    return json({ success: false, config: null, message: 'Pengaturan belum tersedia' }, 200)
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const token = (request.headers.get('X-Admin-Token') ?? '').trim()
    if (!token) {
      return json({ success: false, message: 'Tidak memiliki akses admin' }, 401)
    }

    const tokenHash = token.length === 64 ? token.toLowerCase() : await sha256Hex(token)
    if (tokenHash !== DEFAULT_ADMIN_HASH) {
      return json({ success: false, message: 'Password admin tidak sesuai' }, 403)
    }

    const body = await request.json<{ config?: unknown }>()
    if (!body || typeof body.config !== 'object' || body.config === null) {
      return json({ success: false, message: 'Format konfigurasi tidak valid' }, 400)
    }

    const serialized = JSON.stringify(body.config)
    await ensureTable(env)
    await env.DB.prepare(
      `INSERT INTO wedding_settings (id, config_json, updated_at)
       VALUES (1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         config_json = excluded.config_json,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(serialized)
      .run()

    return json({ success: true, message: 'Perubahan berhasil disimpan ke server' })
  } catch {
    return json({ success: false, message: 'Server D1 belum aktif, perubahan disimpan di browser lokal' }, 500)
  }
}
