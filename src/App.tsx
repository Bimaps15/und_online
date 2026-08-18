import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  Copy,
  Gift as GiftIcon,
  Instagram,
  MapPin,
  Share2,
  CheckSquare,
  Sparkles,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Admin } from './components/Admin'
import { Gallery } from './components/Gallery'
import { Navbar } from './components/Navbar'
import { RSVP, Wishes } from './components/Forms'
import { Button, GlassCard, Toast, WeddingSection } from './components/UI'
import { GebyokCover } from './components/GebyokCover'
import { FallingLeavesCanvas } from './components/FallingLeavesCanvas'
import { GiftModal, RSVPModal, MapModal, GalleryModal } from './components/Modals'
import { MusicPlayer } from './components/MusicPlayer'
import { weddingConfig as config } from './config/wedding'
import { useCountdown } from './hooks/useCountdown'
import { useGuestName } from './hooks/useGuestName'

function Countdown() {
  const countdown = useCountdown(config.wedding.isoDate)
  if (countdown.complete) {
    return <p className="countdown-complete">Hari Bahagia Telah Tiba</p>
  }
  return (
    <div className="countdown">
      {[
        ['Hari', countdown.days],
        ['Jam', countdown.hours],
        ['Menit', countdown.minutes],
        ['Detik', countdown.seconds],
      ].map(([label, value]) => (
        <GlassCard key={label as string}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </GlassCard>
      ))}
    </div>
  )
}

function Couple() {
  const people = [
    { kind: 'groom', person: config.groom, child: 'Putra' },
    { kind: 'bride', person: config.bride, child: 'Putri' },
  ]
  return (
    <WeddingSection id="couple" eyebrow="Dengan memohon rahmat-Nya" title="Kedua Mempelai">
      <p className="section-intro">
        Dengan penuh rasa syukur, kami mengundang Anda untuk menjadi bagian dari awal perjalanan hidup kami dalam ikatan suci pernikahan.
      </p>
      <div className="couple-grid">
        {people.map(({ kind, person, child }) => (
          <motion.article className="couple-card" key={kind} whileHover={{ y: -5 }}>
            <div className={`portrait ${kind}`}>
              <img src={person.photo} alt={`Foto ${person.name}`} />
            </div>
            <p className="script-gold">{person.shortName}</p>
            <h3>{person.name}</h3>
            <span>{child} dari</span>
            <p>
              Bapak {person.father}
              <br />
              &amp;
              <br />
              Ibu {person.mother}
            </p>
            {person.instagram && (
              <a
                href={`https://instagram.com/${person.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={17} /> @{person.instagram}
              </a>
            )}
          </motion.article>
        ))}
      </div>
    </WeddingSection>
  )
}

function Events({ onOpenMap }: { onOpenMap: () => void }) {
  const events = [
    { title: 'Akad Nikah', event: config.akad },
    { title: 'Resepsi Pernikahan', event: config.reception },
  ]

  return (
    <WeddingSection id="event" eyebrow="Save the date" title="Rangkaian Acara">
      <Countdown />
      <div className="event-grid">
        {events.map(({ title, event }) => (
          <GlassCard key={title} className="event-card">
            <CalendarDays className="text-gold" />
            <p className="script-gold">{title}</p>
            <h3>
              {event.day}, {event.date}
            </h3>
            <div>
              <Clock3 size={17} /> {event.time}
            </div>
            <div>
              <MapPin size={17} /> {event.location}
            </div>
            <p>{event.address}</p>
            <div className="event-card-actions">
              <button className="button-inline-gold" onClick={onOpenMap}>
                <MapPin size={15} />
                <span>Lihat Peta Lokasi</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </WeddingSection>
  )
}

function GiftSection({ notify, onOpenGift }: { notify: (message: string) => void; onOpenGift: () => void }) {
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      notify('Nomor rekening berhasil disalin')
    } catch {
      notify('Gagal menyalin. Silakan salin secara manual.')
    }
  }

  return (
    <WeddingSection id="gift" eyebrow="A token of love" title="Kirim Hadiah">
      <p className="section-intro">
        Doa restu Anda merupakan hadiah terindah bagi kami. Namun apabila ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui rekening berikut atau membuka pop-up amplop digital.
      </p>

      <div className="bank-grid">
        {config.banks.map((bank) => (
          <GlassCard key={bank.bank} className="bank-card">
            <GiftIcon className="text-gold" />
            <span>{bank.bank}</span>
            <small>No. Rekening</small>
            <strong>{bank.accountNumber}</strong>
            <small>a.n. {bank.accountName}</small>
            <Button onClick={() => copy(bank.accountNumber)}>
              <Copy size={17} /> Salin Nomor Rekening
            </Button>
          </GlassCard>
        ))}
      </div>

      <div className="center-action-wrapper mt-6">
        <button className="button button-gold-luxury" onClick={onOpenGift}>
          <GiftIcon size={18} />
          <span>Buka Pop-Up Amplop Digital &amp; Hadiah Fisik</span>
        </button>
      </div>
    </WeddingSection>
  )
}

function MainInvitation({
  playing,
  onToggleMusic,
  notify,
  onOpenGift,
  onOpenRSVP,
  onOpenMap,
  onSelectPhoto,
}: {
  playing: boolean
  onToggleMusic: () => void
  notify: (message: string) => void
  onOpenGift: () => void
  onOpenRSVP: () => void
  onOpenMap: () => void
  onSelectPhoto: (index: number) => void
}) {
  const reduceMotion = useReducedMotion()

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `The Wedding of ${config.groom.shortName} & ${config.bride.shortName}`,
          text: `Undangan pernikahan ${config.groom.shortName} & ${config.bride.shortName} — ${config.wedding.date}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        notify('Link undangan berhasil disalin')
      }
    } catch {
      /* User cancelled share sheet */
    }
  }

  const [dateNumber, dateMonth, dateYear] = config.wedding.date.split(' ')
  const calendarStart = new Date(config.akad.isoDate)
  const calendarEnd = new Date(calendarStart.getTime() + 6 * 60 * 60 * 1000)
  const toCalendarDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const calendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Pernikahan ${config.groom.shortName} & ${config.bride.shortName}`
  )}&dates=${toCalendarDate(calendarStart)}/${toCalendarDate(calendarEnd)}&details=${encodeURIComponent(
    'Kami menantikan kehadiran Anda di hari bahagia kami.'
  )}&location=${encodeURIComponent(config.reception.address)}`

  return (
    <>
      <Navbar
        onOpenGift={onOpenGift}
        onOpenRSVP={onOpenRSVP}
        onOpenMap={onOpenMap}
      />

      <main>
        {/* HERO SECTION */}
        <section id="home" className="hero">
          <motion.div
            className="hero-inner"
            initial={reduceMotion ? false : { opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { delay: 0.15, duration: 0.8, type: 'spring', stiffness: 110, damping: 14 }
            }
          >
            <motion.p
              className="script-gold"
              initial={reduceMotion ? false : { opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              The Wedding Of
            </motion.p>

            <h1>
              {config.groom.shortName} <i className="ampersand-hero">&amp;</i> {config.bride.shortName}
            </h1>

            <p className="hero-quote">
              &quot;Dan di antara tanda-tanda kebesaran-Nya, Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya.&quot;
            </p>

            <div className="hero-date">
              <span>{config.wedding.day}</span>
              <strong>{dateNumber}</strong>
              <span>
                {dateMonth}
                <br />
                {dateYear}
              </span>
            </div>

            <div className="hero-actions">
              <button className="button" onClick={onOpenRSVP}>
                <CheckSquare size={18} /> Confirm RSVP
              </button>

              <button className="icon-action" onClick={share} aria-label="Bagikan undangan">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        </section>

        {/* MEMPELAI */}
        <Couple />

        {/* RANGKAIAN ACARA */}
        <Events onOpenMap={onOpenMap} />

        {/* GALERI FOTO */}
        <Gallery onSelectPhoto={onSelectPhoto} />

        {/* LOKASI ACARA */}
        <WeddingSection id="location" eyebrow="Tempat bahagia kami" title="Lokasi Acara">
          <GlassCard className="location-card">
            <MapPin className="text-gold" size={28} />
            <div>
              <h3>{config.reception.location}</h3>
              <p>{config.reception.address}</p>
            </div>
            <button className="button" onClick={onOpenMap}>
              <Sparkles size={16} /> Petunjuk Google Maps
            </button>
          </GlassCard>
        </WeddingSection>

        {/* RSVP FORM & BUKU TAMU */}
        <RSVP />

        {/* UCAPAN & DOA RESTU */}
        <Wishes />

        {/* HADIAH DIGITAL */}
        <GiftSection notify={notify} onOpenGift={onOpenGift} />

        {/* CLOSING SECTION */}
        <section className="closing">
          <p>
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir di hari bahagia kami.
          </p>

          <span className="script-gold-lg">Terima Kasih</span>

          <h2>
            {config.groom.shortName} <i className="ampersand-hero">&amp;</i> {config.bride.shortName}
          </h2>

          <div className="closing-actions">
            <button onClick={share}>
              <Share2 size={18} /> Bagikan Undangan
            </button>
            <a href={calendar} target="_blank" rel="noopener noreferrer">
              <CalendarPlus size={18} /> Simpan ke Kalender
            </a>
          </div>
        </section>
      </main>

      {/* FLOATING VINYL MUSIC PLAYER */}
      <MusicPlayer playing={playing} onToggle={onToggleMusic} songTitle={config.music.title} />
    </>
  )
}

export default function App() {
  const guestName = useGuestName()
  const [opened, setOpened] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [toast, setToast] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  // Modal States
  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

  if (window.location.pathname.startsWith('/admin')) {
    return <Admin />
  }

  if (
    window.location.pathname.startsWith('/seserahan') ||
    window.location.pathname.startsWith('/budget')
  ) {
    window.location.replace('/seserahan/index.html')
    return null
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }

  const playMusic = async () => {
    if (!audioRef.current) return
    try {
      await audioRef.current.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
      notify('Musik belum dapat diputar otomatis. Klik tombol vinyl di pojok kanan bawah.')
    }
  }

  const handleOpenCover = () => {
    setOpened(true)
    window.setTimeout(playMusic, 350)
  }

  const toggleMusic = () => {
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
    } else {
      void playMusic()
    }
  }

  const openGalleryPhoto = (index: number) => {
    setActiveGalleryIndex(index)
    setGalleryModalOpen(true)
  }

  return (
    <>
      {/* Background Falling Leaves Particle Canvas */}
      <FallingLeavesCanvas />

      {/* Background Audio */}
      <audio ref={audioRef} src={config.music.src} loop preload="none" />

      {/* Cover with 3D Gebyok Doors & 3D Javanese Pop-Up Stage */}
      <AnimatePresence>
        {!opened && <GebyokCover guestName={guestName} onOpen={handleOpenCover} />}
      </AnimatePresence>

      {/* Main Invitation Page */}
      {opened && (
        <MainInvitation
          playing={playing}
          onToggleMusic={toggleMusic}
          notify={notify}
          onOpenGift={() => setGiftModalOpen(true)}
          onOpenRSVP={() => setRsvpModalOpen(true)}
          onOpenMap={() => setMapModalOpen(true)}
          onSelectPhoto={openGalleryPhoto}
        />
      )}

      {/* Interactive Modals */}
      <GiftModal
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        notify={notify}
      />

      <RSVPModal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        notify={notify}
      />

      <MapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
      />

      <GalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        initialIndex={activeGalleryIndex}
      />

      {/* Toast Notifications */}
      {toast && <Toast message={toast} />}
    </>
  )
}


