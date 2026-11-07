import { resolveGuest } from './_guest'
import { json, type Env } from './_shared'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const guest = await resolveGuest(request, env)
    return json({ success: !!guest, name: guest?.name ?? '' })
  } catch {
    return json({ success: false, message: 'Identitas tamu sementara tidak tersedia.' }, 503)
  }
}
