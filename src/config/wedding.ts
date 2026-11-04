export type EventConfig = {
  day: string
  date: string
  isoDate: string
  time: string
  location: string
  address: string
  googleMapsUrl: string
}

export type BankAccountConfig = {
  bank: string
  accountNumber: string
  accountName: string
}

export type QrisConfig = {
  enabled: boolean
  image: string
}

export type PersonConfig = {
  name: string
  shortName: string
  father: string
  mother: string
  instagram: string
  photo: string
}

export type GalleryItemConfig = {
  src: string
  alt: string
}

export type WeddingConfigData = {
  groom: PersonConfig
  bride: PersonConfig
  /** Foto pasangan di bawah nama pada bagian "The Wedding Of"; kotak mengikuti ukuran foto. Kosongkan jika belum ada. */
  couplePhoto: string
  wedding: {
    day: string
    date: string
    isoDate: string
    timezone: string
  }
  akad: EventConfig
  reception: EventConfig
  banks: BankAccountConfig[]
  qris: QrisConfig
  gallery: GalleryItemConfig[]
  music: {
    src: string
    title: string
  }
  turnstileSiteKey: string
  moderationEnabled: boolean
}

export const defaultWeddingConfig: WeddingConfigData = {
  groom: {
    name: 'Bima Prasetya Saputra',
    shortName: 'Bima',
    father: 'Achmad Sofiudin',
    mother: 'Achmad Sofiudin',
    instagram: 'bmprsa_',
    photo: '/images/botanical-hero.png',
  },
  bride: {
    name: 'Alviana Khaerunnisa',
    shortName: 'Alviana',
    father: 'Condro Eko Prayitno',
    mother: 'Condro Eko Prayitno',
    instagram: 'alviaana_',
    photo: '/images/botanical-hero.png',
  },
  // Foto pasangan (portrait/landscape bebas, kotak menyesuaikan ukuran foto). Isi dengan path (mis. '/images/couple.webp') atau URL foto asli.
  // Biarkan kosong ('') jika belum ada — foto tidak akan ditampilkan.
  couplePhoto: '',
  wedding: {
    day: 'Senin',
    date: '07 Desember 2026',
    isoDate: '2026-12-07T08:00:00+07:00',
    timezone: 'Asia/Jakarta',
  },
  akad: {
    day: 'Senin',
    date: '07 Desember 2026',
    isoDate: '2026-12-07T08:00:00+07:00',
    time: '08.00 WIB',
    location: 'Endah Residence 2',
    address: 'Blok H No 6, Batiombo, Bandar, Batang',
    googleMapsUrl: 'https://maps.app.goo.gl/3wwFiPpDviQ2JQ1c9',
  },
  reception: {
    day: 'Senin',
    date: '07 Desember 2026',
    isoDate: '2026-12-07T08:00:00+07:00',
    time: '13.00 WIB',
    location: 'Endah Residence 2',
    address: 'Blok H No 6, Batiombo, Bandar, Batang',
    googleMapsUrl: 'https://maps.app.goo.gl/3wwFiPpDviQ2JQ1c9',
  },

  // Konfigurasi Hadiah Cashless (1-2 Rekening Bank & QRIS)
  // Hanya rekening atau QRIS yang datanya terisi yang akan ditampilkan.
  banks: [
    { bank: 'BCA', accountNumber: '3820194666', accountName: 'BIMA PRASETYA SAPUTRA' },
    { bank: 'SeaBank', accountNumber: '901399590607', accountName: 'ALVIANA KHAERUNNISA' },
  ],
  qris: {
    enabled: false,
    image: '',
  },

  gallery: [
    { src: '/images/gallery-1.png', alt: 'Momen Bima dan Alviana 1' },
    { src: '/images/gallery-2.png', alt: 'Momen Bima dan Alviana 2' },
    { src: '/images/gallery-3.png', alt: 'Momen Bima dan Alviana 3' },
    { src: '/images/gallery-4.png', alt: 'Momen Bima dan Alviana 4' },
    { src: '/images/gallery-5.png', alt: 'Momen Bima dan Alviana 5' },
    { src: '/images/gallery-6.png', alt: 'Momen Bima dan Alviana 6' },
  ],
  music: { src: '/music/di-akhir-perang.m4a', title: 'Nadin Amizah - Di Akhir Perang' },
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '',
  moderationEnabled: false,
}

const STORAGE_KEY = 'wedding_custom_config_v1'
const listeners = new Set<() => void>()

function cloneConfig(source: WeddingConfigData): WeddingConfigData {
  return JSON.parse(JSON.stringify(source)) as WeddingConfigData
}

function mergeConfig(base: WeddingConfigData, override?: Partial<WeddingConfigData> | null): WeddingConfigData {
  if (!override || typeof override !== 'object') return cloneConfig(base)
  return {
    ...base,
    groom: { ...base.groom, ...(override.groom ?? {}) },
    bride: { ...base.bride, ...(override.bride ?? {}) },
    couplePhoto: typeof override.couplePhoto === 'string' ? override.couplePhoto : base.couplePhoto,
    wedding: { ...base.wedding, ...(override.wedding ?? {}) },
    akad: { ...base.akad, ...(override.akad ?? {}) },
    reception: { ...base.reception, ...(override.reception ?? {}) },
    banks: Array.isArray(override.banks) ? override.banks.map((b) => ({ ...b })) : base.banks.map((b) => ({ ...b })),
    qris: { ...base.qris, ...(override.qris ?? {}) },
    gallery: Array.isArray(override.gallery) && override.gallery.length > 0
      ? override.gallery.map((g) => ({ ...g }))
      : base.gallery.map((g) => ({ ...g })),
    music: { ...base.music, ...(override.music ?? {}) },
    turnstileSiteKey: base.turnstileSiteKey,
    moderationEnabled: override.moderationEnabled ?? base.moderationEnabled,
  }
}

function loadFromLocalStorage(): WeddingConfigData {
  if (typeof window === 'undefined') return cloneConfig(defaultWeddingConfig)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneConfig(defaultWeddingConfig)
    const parsed = JSON.parse(raw) as Partial<WeddingConfigData>
    return mergeConfig(defaultWeddingConfig, parsed)
  } catch {
    return cloneConfig(defaultWeddingConfig)
  }
}

export const weddingConfig: WeddingConfigData = loadFromLocalStorage()

function assignInPlace(next: WeddingConfigData) {
  Object.assign(weddingConfig.groom, next.groom)
  Object.assign(weddingConfig.bride, next.bride)
  weddingConfig.couplePhoto = next.couplePhoto
  Object.assign(weddingConfig.wedding, next.wedding)
  Object.assign(weddingConfig.akad, next.akad)
  Object.assign(weddingConfig.reception, next.reception)
  weddingConfig.banks.splice(0, weddingConfig.banks.length, ...next.banks)
  Object.assign(weddingConfig.qris, next.qris)
  weddingConfig.gallery.splice(0, weddingConfig.gallery.length, ...next.gallery)
  Object.assign(weddingConfig.music, next.music)
  listeners.forEach((fn) => fn())
}

export function applyWeddingConfig(override: Partial<WeddingConfigData>, saveLocal = true): WeddingConfigData {
  const merged = mergeConfig(defaultWeddingConfig, override)
  assignInPlace(merged)
  if (saveLocal && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    } catch {
      /* ignore storage quota errors */
    }
  }
  return merged
}

export function resetWeddingConfigLocal(): WeddingConfigData {
  const fresh = cloneConfig(defaultWeddingConfig)
  assignInPlace(fresh)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
  return fresh
}

export function subscribeWeddingConfig(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export async function syncWeddingConfigFromServer(): Promise<void> {
  try {
    const res = await fetch('/api/settings', { headers: { accept: 'application/json' } })
    if (!res.ok) return
    const data = (await res.json()) as { success?: boolean; config?: Partial<WeddingConfigData> | null }
    if (data?.success && data.config) {
      applyWeddingConfig(data.config, true)
    }
  } catch {
    /* fallback to local/default config */
  }
}
