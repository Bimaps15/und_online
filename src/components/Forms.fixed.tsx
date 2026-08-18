import { FormEvent, useEffect, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { weddingConfig } from '../config/wedding'
import { Button, Field, GlassCard, WeddingSection } from './UI'

type State = 'idle' | 'loading' | 'success' | 'error'
type Wish = { id: number; guest_name: string; message: string; created_at: string }
async function postJson(url: string, body: unknown) { const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const data = await response.json() as { success: boolean; message: string }; if (!response.ok || !data.success) throw new Error(data.message); return data }

function Captcha({ onToken }: { onToken: (token: string) => void }) { return weddingConfig.turnstileSiteKey ? <Turnstile siteKey={weddingConfig.turnstileSiteKey} onSuccess={onToken} options={{ theme: 'dark' }} /> : <p className="form-note">Turnstile aktif otomatis setelah site key Cloudflare dikonfigurasi.</p> }

export function RSVP() {
  const [state, setState] = useState<State>('idle'); const [feedback, setFeedback] = useState(''); const [token, setToken] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setState('loading'); const form = new FormData(event.currentTarget); try { const result = await postJson('/api/rsvp', { name: form.get('name'), attendance: form.get('attendance'), guestCount: Number(form.get('guestCount')), message: form.get('message'), turnstileToken: token }); setFeedback(result.message); setState('success'); event.currentTarget.reset() } catch (error) { setFeedback(error instanceof Error ? error.message : 'Konfirmasi belum dapat dikirim.'); setState('error') } }
  return <WeddingSection id="rsvp" eyebrow="Kindly reply" title="Konfirmasi Kehadiran"><GlassCard className="form-card"><p>Mohon konfirmasi kehadiran Anda agar kami dapat mempersiapkan hari bahagia ini dengan baik.</p><form onSubmit={submit}><Field label="Nama"><input name="name" required maxLength={100} autoComplete="name" /></Field><div className="form-row"><Field label="Status kehadiran"><select name="attendance" required defaultValue=""><option value="" disabled>Pilih status</option><option value="hadir">Hadir</option><option value="tidak_hadir">Tidak Hadir</option><option value="belum_pasti">Masih Belum Pasti</option></select></Field><Field label="Jumlah tamu"><select name="guestCount" defaultValue="1">{[1,2,3,4].map(n => <option key={n}>{n}</option>)}</select></Field></div><Field label="Pesan (opsional)"><textarea name="message" maxLength={500} rows={3} /></Field><Captcha onToken={setToken} /><Button disabled={state === 'loading'}>{state === 'loading' ? 'Mengirim...' : 'Kirim Konfirmasi'}</Button>{feedback && <p className={`feedback ${state}`}>{feedback}</p>}</form></GlassCard></WeddingSection>
}

export function Wishes() {
  const [state, setState] = useState<State>('idle'); const [feedback, setFeedback] = useState(''); const [token, setToken] = useState(''); const [wishes, setWishes] = useState<Wish[]>([])
  const load = () => fetch('/api/wishes?page=1&limit=20').then(r => r.ok ? r.json() : Promise.reject()).then((data: { wishes: Wish[] }) => setWishes(data.wishes)).catch(() => setWishes([]))
  useEffect(() => { void load() }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setState('loading'); const form = new FormData(event.currentTarget); try { const result = await postJson('/api/wishes', { name: form.get('name'), message: form.get('message'), turnstileToken: token }); setFeedback(result.message); setState('success'); event.currentTarget.reset(); load() } catch (error) { setFeedback(error instanceof Error ? error.message : 'Ucapan belum dapat dikirim.'); setState('error') } }
  return <WeddingSection id="wishes" eyebrow="Warm wishes" title="Ucapan & Doa"><div className="wishes-layout"><GlassCard className="form-card"><form onSubmit={submit}><Field label="Nama"><input name="name" required maxLength={100} /></Field><Field label="Ucapan terbaik"><textarea name="message" required maxLength={500} rows={5} /></Field><Captcha onToken={setToken} /><Button disabled={state === 'loading'}>{state === 'loading' ? 'Mengirim...' : 'Kirim Ucapan'}</Button>{feedback && <p className={`feedback ${state}`}>{feedback}</p>}</form></GlassCard><div className="wish-list">{wishes.length ? wishes.map(wish => <GlassCard key={wish.id} className="wish-card"><strong>{wish.guest_name}</strong><p>{wish.message}</p><small>{new Date(wish.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</small></GlassCard>) : <GlassCard className="empty-state"><p>Belum ada ucapan.</p><span>Jadilah yang pertama memberikan doa terbaik.</span></GlassCard>}</div></div></WeddingSection>
}

