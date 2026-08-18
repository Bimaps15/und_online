export type EventConfig = {
  day: string
  date: string
  isoDate: string
  time: string
  location: string
  address: string
  googleMapsUrl: string
}

export const weddingConfig = {
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
  wedding: {
    day: 'Senin',
    date: '07 Desember 2026',
    isoDate: '2026-12-07T08:00:00+07:00',
    timezone: 'Asia/Jakarta',
  },
  akad: {
    day: 'Senin', date: '07 Desember 2026', isoDate: '2026-12-07T08:00:00+07:00', time: '08.00 WIB',
    location: 'Endah Residence 2', address: 'Blok H No 6, Batiombo, Bandar, Batang', googleMapsUrl: 'https://maps.app.goo.gl/3wwFiPpDviQ2JQ1c9',
  } satisfies EventConfig,
  reception: {
    day: 'Senin', date: '07 Desember 2026', isoDate: '2026-12-07T08:00:00+07:00', time: '13.00 WIB',
    location: 'Endah Residence 2', address: 'Blok H No 6, Batiombo, Bandar, Batang', googleMapsUrl: 'https://maps.app.goo.gl/3wwFiPpDviQ2JQ1c9',
  } satisfies EventConfig,
  banks: [
    { bank: 'BCA', accountNumber: '3820194666', accountName: 'BIMA PRASETYA SAPUTRA' },
    { bank: 'SeaBank', accountNumber: '901399590607', accountName: 'ALVIANA KHAERUNNISA' },
  ],
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
  qris: { enabled: false, image: '' },
} as const

