import { useGuestIdentity } from '../hooks/GuestIdentityProvider'
import { personalLinkMessage } from '../lib/guestIdentity'
import { ReactNode, useEffect, useState, FormEvent } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  X,
  Copy,
  CheckCircle2,
  Gift as GiftIcon,
  MapPin,
  CalendarDays,
  Clock3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  QrCode,
  Home,
  ZoomIn,
} from 'lucide-react'
import { weddingConfig as config } from '../config/wedding'
import { Turnstile } from '@marsidev/react-turnstile'
import { Button, Field } from './UI'

interface ModalShellProps {
  id: string
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

export function ModalShell({ id, isOpen, onClose, title, subtitle, children }: ModalShellProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop-fixed" id={id} role="dialog" aria-modal="true">
          <motion.div
            className="modal-overlay"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, transition: { duration: 0.24, ease: 'easeOut' } }
            }
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } }
            }
            onClick={onClose}
          />
          <motion.div
            className="modal-container-glass"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    scale: 0.98,
                    transition: { duration: 0.16, ease: 'easeIn' },
                  }
            }
          >
            <div className="modal-header">
              <div className="modal-header-text">
                <span className="script-gold-sm">{subtitle || 'Pernikahan Bima & Alviana'}</span>
                <h2>{title}</h2>
              </div>
              <button className="modal-close-btn" onClick={onClose} aria-label="Tutup pop-up">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body-scroll">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ==========================================================================
   1. GIFT MODAL (#giftModal)
   ========================================================================== */
export function GiftModal({
  isOpen,
  onClose,
  notify,
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
}) {
  const [copiedBank, setCopiedBank] = useState<string | null>(null)
  const [showQris, setShowQris] = useState(false)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBank(label)
      notify(`${label} berhasil disalin`)
      setTimeout(() => setCopiedBank(null), 2500)
    } catch {
      notify('Gagal menyalin. Silakan salin secara manual.')
    }
  }

  return (
    <ModalShell
      id="giftModal"
      isOpen={isOpen}
      onClose={onClose}
      title="Amplop Digital & Hadiah"
      subtitle="A Token of Love"
    >
      <div className="gift-modal-content">
        <p className="modal-intro-p">
          Doa restu Anda merupakan hadiah terindah bagi kami. Namun apabila Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui rekening bank atau alamat pengiriman berikut.
        </p>

        <div className="gift-cards-grid">
          {config.banks.map((bank) => (
            <div key={bank.bank} className="gift-bank-card">
              <div className="gift-bank-badge">
                <GiftIcon size={16} />
                <span>Transfer Bank</span>
              </div>
              <h3>{bank.bank}</h3>
              <div className="account-number-box">
                <strong>{bank.accountNumber}</strong>
                <button
                  className="btn-copy-account"
                  onClick={() => copyToClipboard(bank.accountNumber, `Nomor rekening ${bank.bank}`)}
                >
                  {copiedBank === `Nomor rekening ${bank.bank}` ? (
                    <>
                      <CheckCircle2 size={16} className="text-sage" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Salin No. Rek</span>
                    </>
                  )}
                </button>
              </div>
              <small className="account-holder">a.n. {bank.accountName}</small>
            </div>
          ))}
        </div>

        {/* Physical Gift Shipping Address Card */}
        <div className="physical-gift-card">
          <div className="physical-gift-header">
            <Home size={18} className="text-gold" />
            <h4>Kirim Hadiah Fisik</h4>
          </div>
          <p className="physical-address-text">
            <strong>Kediaman Mempelai:</strong><br />
            {config.reception.address} ({config.reception.location})
          </p>
          <button
            className="btn-copy-address"
            onClick={() => copyToClipboard(config.reception.address, 'Alamat fisik')}
          >
            <Copy size={16} />
            <span>Salin Alamat Fisik</span>
          </button>
        </div>

        {/* Optional QRIS Toggle */}
        {config.qris.enabled && (
          <div className="qris-section">
            <button className="btn-toggle-qris" onClick={() => setShowQris(!showQris)}>
              <QrCode size={18} />
              <span>{showQris ? 'Sembunyikan QRIS' : 'Tampilkan QRIS Pembayaran'}</span>
            </button>
            {showQris && (
              <div className="qris-img-container">
                <img src={config.qris.image || '/images/qris-placeholder.png'} alt="QRIS Kode Pembayaran" />
                <small>Scan QRIS menggunakan Mobile Banking atau E-Wallet Anda</small>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  )
}

/* ==========================================================================
   1B. CASHLESS WEDDING GIFT MODAL (#cashlessGiftModal)
   ========================================================================== */
export function CashlessGiftModal({
  isOpen,
  onClose,
  notify,
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [zoomQris, setZoomQris] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setZoomQris(false)
      setCopiedAccount(null)
    }
  }, [isOpen])

  const validBanks = config.banks
    .filter(
      (item) =>
        Boolean(item.bank?.trim()) &&
        Boolean(item.accountNumber?.trim()) &&
        Boolean(item.accountName?.trim())
    )
    .slice(0, 2)

  const hasQris = Boolean(config.qris?.enabled && config.qris?.image?.trim())

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopiedAccount(accountNumber)
      notify('Nomor rekening berhasil disalin')
      window.setTimeout(() => {
        setCopiedAccount((prev) => (prev === accountNumber ? null : prev))
      }, 2500)
    } catch {
      notify('Gagal menyalin. Silakan salin secara manual.')
    }
  }

  return (
    <>
      <ModalShell
        id="cashlessGiftModal"
        isOpen={isOpen}
        onClose={onClose}
        title="Wedding Gift"
        subtitle="Cashless Gift"
      >
        <div className="cashless-gift-modal-body">
          <p className="modal-intro-p">
            Terima kasih atas doa restu dan tanda kasih yang Anda berikan untuk mengiringi langkah awal pernikahan kami.
          </p>

          {validBanks.length > 0 && (
            <div className="cashless-banks-list">
              {validBanks.map((bank, index) => {
                const isCopied = copiedAccount === bank.accountNumber
                const offsetX = index % 2 === 0 ? -28 : 28
                return (
                  <motion.div
                    key={`${bank.bank}-${bank.accountNumber}`}
                    className="cashless-bank-card"
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: offsetX }
                    }
                    animate={
                      reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, x: 0 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0.18, delay: index * 0.06, ease: 'easeOut' }
                        : { duration: 0.45, delay: 0.1 + index * 0.14, ease: [0.22, 1, 0.36, 1] }
                    }
                  >
                    <div className="cashless-bank-top">
                      <span className="cashless-bank-label">Transfer Bank</span>
                      <h3 className="cashless-bank-name">{bank.bank}</h3>
                    </div>

                    <div className="cashless-account-box">
                      <div className="cashless-account-details">
                        <small>Nomor Rekening</small>
                        <strong className="cashless-account-number">{bank.accountNumber}</strong>
                        <span className="cashless-account-holder">a.n. {bank.accountName}</span>
                      </div>
                    </div>

                    <div className="cashless-bank-actions">
                      <button
                        type="button"
                        className={`cashless-copy-btn ${isCopied ? 'is-copied' : ''}`}
                        onClick={() => handleCopyAccount(bank.accountNumber)}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 size={17} />
                            <span>Nomor rekening berhasil disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={17} />
                            <span>Salin Rekening</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {hasQris && (
            <div className="cashless-qris-card">
              <div className="cashless-qris-header">
                <QrCode size={18} className="text-gold" />
                <div>
                  <h3>QRIS</h3>
                  <small>Scan kode QR di bawah ini menggunakan aplikasi perbankan atau dompet digital Anda</small>
                </div>
              </div>

              <div className="cashless-qris-preview">
                <img
                  src={config.qris.image}
                  alt="Kode QRIS Wedding Gift"
                  onClick={() => setZoomQris(true)}
                />
              </div>

              <button
                type="button"
                className="cashless-qris-zoom-btn"
                onClick={() => setZoomQris(true)}
              >
                <ZoomIn size={17} />
                <span>Perbesar Gambar</span>
              </button>
            </div>
          )}

          {validBanks.length === 0 && !hasQris && (
            <div className="cashless-empty-note">
              <p>Data rekening atau QRIS belum tersedia saat ini.</p>
            </div>
          )}

          <div className="cashless-modal-footer">
            <button type="button" className="cashless-close-mobile-btn" onClick={onClose}>
              <X size={18} />
              <span>Tutup</span>
            </button>
          </div>
        </div>
      </ModalShell>

      <AnimatePresence>
        {isOpen && zoomQris && hasQris && (
          <div
            className="qris-zoom-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Preview ukuran penuh QRIS"
          >
            <motion.div
              className="qris-zoom-overlay"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } }
              }
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }
              }
              onClick={() => setZoomQris(false)}
            />
            <motion.div
              className="qris-zoom-dialog"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={
                reduceMotion
                  ? { opacity: 1, scale: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                    }
              }
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : {
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.15, ease: 'easeIn' },
                    }
              }
            >
              <div className="qris-zoom-header">
                <span>Kode QRIS Wedding Gift</span>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setZoomQris(false)}
                  aria-label="Tutup perbesaran QRIS"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="qris-zoom-image-wrap">
                <img src={config.qris.image} alt="Kode QRIS Wedding Gift Diperbesar" />
              </div>
              <button
                type="button"
                className="cashless-close-mobile-btn"
                onClick={() => setZoomQris(false)}
              >
                <X size={18} />
                <span>Tutup Gambar</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ==========================================================================
   2. RSVP & BUKU TAMU MODAL (#rsvpModal)
   ========================================================================== */
export function RSVPModal({
  isOpen,
  onClose,
  notify,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
  onSuccess?: () => void
}) {
  const guest = useGuestIdentity()
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')
  const [token, setToken] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!guest.valid || guest.loading) return
    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    setState('loading')
    setFeedback('')

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        referrerPolicy: 'same-origin',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          name: guest.name,
          attendance: formData.get('attendance'),
          guestCount: Number(formData.get('guestCount')),
          message: formData.get('message'),
          turnstileToken: token,
        }),
      })

      const text = await response.text()
      let data: { success: boolean; message: string }
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Layanan konfirmasi sedang tidak tersedia. Silakan coba beberapa saat lagi.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Konfirmasi RSVP belum dapat dikirim.')
      }

      setState('success')
      setFeedback('Konfirmasi kehadiran & ucapan Anda telah berhasil disimpan!')
      notify('Konfirmasi & ucapan berhasil dikirim!')
      formElement.reset()

      if (onSuccess) onSuccess()
      setTimeout(() => {
        onClose()
        setState('idle')
        setFeedback('')
      }, 2000)
    } catch (err) {
      setState('error')
      setFeedback(err instanceof Error ? err.message : 'Gagal mengirim konfirmasi RSVP.')
    }
  }

  return (
    <ModalShell
      id="rsvpModal"
      isOpen={isOpen}
      onClose={onClose}
      title="RSVP & Buku Tamu"
      subtitle="Konfirmasi Kehadiran"
    >
      <form className="rsvp-modal-form" onSubmit={handleSubmit}>
        <p className="modal-intro-p">
          Mohon isi form berikut untuk membantu kami mempersiapkan tempat dan jamuan pesta pernikahan.
        </p>

        <Field label="Nama Lengkap">
          <input
            type="text"
            name="name"
            value={guest.name}
            readOnly
            autoComplete="off"
          />
        </Field>

        <div className="form-grid-2">
          <Field label="Status Kehadiran">
            <select name="attendance" required defaultValue="">
              <option value="" disabled>
                Pilih Konfirmasi Kehadiran
              </option>
              <option value="hadir">Hadir di Acara</option>
              <option value="tidak_hadir">Tidak Dapat Hadir</option>
              <option value="belum_pasti">Masih Belum Pasti</option>
            </select>
          </Field>

          <Field label="Jumlah Tamu">
            <select name="guestCount" defaultValue="1">
              <option value="1">1 Orang</option>
              <option value="2">2 Orang</option>
              <option value="3">3 Orang</option>
              <option value="4">4 Orang</option>
            </select>
          </Field>
        </div>

        <Field label="Ucapan Doa Restu & Pesan (opsional)">
          <textarea
            name="message"
            rows={4}
            maxLength={500}
            placeholder="Tuliskan ucapan dan doa restu terbaik Anda..."
          />
        </Field>

        {config.turnstileSiteKey ? (
          <Turnstile siteKey={config.turnstileSiteKey} onSuccess={setToken} options={{ theme: 'light' }} />
        ) : null}

        {!guest.valid && <p className="form-note" role="status">{personalLinkMessage}</p>}
        <Button type="submit" disabled={!guest.valid || guest.loading || state === 'loading'} className="w-full justify-center">
          <Send size={18} />
          <span>{state === 'loading' ? 'Mengirim...' : 'Kirim Konfirmasi Kehadiran'}</span>
        </Button>

        {feedback && (
          <p className={`form-feedback-pill ${state === 'success' ? 'is-success' : 'is-error'}`}>
            {feedback}
          </p>
        )}
      </form>
    </ModalShell>
  )
}

/* ==========================================================================
   3. MAP & LOKASI MODAL (#mapModal)
   ========================================================================== */
export function MapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalShell
      id="mapModal"
      isOpen={isOpen}
      onClose={onClose}
      title="Lokasi & Petunjuk Arah"
      subtitle="Google Maps Navigasi"
    >
      <div className="map-modal-content">
        <div className="event-venue-card">
          <div className="venue-header">
            <MapPin size={20} className="text-gold" />
            <h3>{config.reception.location}</h3>
          </div>
          <p className="venue-address">{config.reception.address}</p>

          <div className="event-times-row">
            <div className="time-chip">
              <CalendarDays size={16} />
              <span>{config.reception.day}, {config.reception.date}</span>
            </div>
            <div className="time-chip">
              <Clock3 size={16} />
              <span>Akad: {config.akad.time} | Resepsi: {config.reception.time}</span>
            </div>
          </div>
        </div>

        {/* Embedded Map Preview Box */}
        <div className="map-embed-wrapper">
          <iframe
            title="Peta Lokasi Pernikahan"
            src="https://maps.google.com/maps?q=Endah%20Residence%202%20Batang&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="260"
            style={{ border: 0, borderRadius: '16px' }}
            allowFullScreen={false}
            loading="lazy"
          />
        </div>

        <div className="map-action-bar">
          <a
            href={config.reception.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-gold-full"
          >
            <ExternalLink size={18} />
            <span>Buka Petunjuk Arah Google Maps</span>
          </a>
        </div>
      </div>
    </ModalShell>
  )
}

/* ==========================================================================
   4. GALLERY LIGHTBOX MODAL (#galleryModal)
   ========================================================================== */
export function GalleryModal({
  isOpen,
  onClose,
  initialIndex = 0,
}: {
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, onClose])

  const move = (dir: number) => {
    const total = config.gallery.length
    setCurrentIndex((prev) => (prev + dir + total) % total)
  }

  const activeImage = config.gallery[currentIndex] || config.gallery[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="lightbox-modal-fullscreen" id="galleryModal" role="dialog" aria-modal="true">
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="lightbox-stage"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          >
            <div className="lightbox-top-bar">
              <span className="lightbox-counter">
                Foto {currentIndex + 1} dari {config.gallery.length}
              </span>
              <button className="lightbox-close-btn" onClick={onClose} aria-label="Tutup foto">
                <X size={22} />
              </button>
            </div>

            <div className="lightbox-main-view">
              <button
                className="lightbox-nav-btn prev"
                onClick={() => move(-1)}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="lightbox-img-wrapper">
                <motion.img
                  key={currentIndex}
                  src={activeImage.src}
                  alt={activeImage.alt}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                />
              </div>

              <button
                className="lightbox-nav-btn next"
                onClick={() => move(1)}
                aria-label="Foto selanjutnya"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            <div className="lightbox-caption">
              <p>{activeImage.alt}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

