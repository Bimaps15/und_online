import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarCheck, CircleHelp, MessageCircle, UserCheck, UserX } from 'lucide-react'
import { GlassCard } from './UI'

type Stats = { totalRsvp: number; attending: number; absent: number; uncertain: number; totalWishes: number }
const emptyStats: Stats = { totalRsvp: 0, attending: 0, absent: 0, uncertain: 0, totalWishes: 0 }

export function Admin() {
  const [stats, setStats] = useState(emptyStats)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => { fetch('/api/admin/stats').then(r => { if (!r.ok) throw new Error(); return r.json() }).then((data: { stats: Stats }) => setStats(data.stats)).catch(() => setUnavailable(true)) }, [])
  const cards = [[CalendarCheck, 'Total RSVP', stats.totalRsvp], [UserCheck, 'Hadir', stats.attending], [UserX, 'Tidak Hadir', stats.absent], [CircleHelp, 'Belum Pasti', stats.uncertain], [MessageCircle, 'Total Ucapan', stats.totalWishes]] as const
  return <main className="admin"><a href="/" className="back-link"><ArrowLeft size={18} /> Kembali ke undangan</a><div className="admin-heading"><span>Private dashboard</span><h1>Ringkasan Tamu</h1><p>Proteksi route ini dengan Cloudflare Access sebelum deployment production.</p></div>{unavailable && <p className="admin-notice">Data statistik belum tersedia. Pastikan binding D1 dan Cloudflare Access sudah dikonfigurasi.</p>}<div className="stats-grid">{cards.map(([Icon, label, value]) => <GlassCard key={label} className="stat-card"><Icon /><span>{label}</span><strong>{value}</strong></GlassCard>)}</div></main>
}
