import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { GlassCard, WeddingSection } from './UI'
import { parseFormattedText } from '../lib/formatText'
import { weddingConfig as config } from '../config/wedding'

export function LoveStory() {
  const reduceMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<number>(0)

  // Ambil slide yang memiliki teks atau heading
  const stories = (config.loveStory ?? [])
    .map((item) =>
      typeof item === 'string'
        ? { title: '', content: item }
        : { title: item.title ?? '', content: item.content ?? '' }
    )
    .filter((item) => item.content.trim().length > 0 || item.title.trim().length > 0)

  // Pastikan indeks tidak keluar dari jangkauan saat data berkurang
  useEffect(() => {
    if (stories.length > 0 && currentIndex >= stories.length) {
      setCurrentIndex(Math.max(0, stories.length - 1))
    }
  }, [stories.length, currentIndex])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, stories.length])

  const goToSlide = (idx: number) => {
    if (idx === currentIndex) return
    setDirection(idx > currentIndex ? 1 : -1)
    setCurrentIndex(idx)
  }

  // Navigasi keyboard (Desktop: ArrowLeft & ArrowRight)
  useEffect(() => {
    if (stories.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stories.length, goToPrev, goToNext])

  // Navigasi gesture swipe untuk HP tanpa mengganggu scroll vertikal
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchMoved = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchMoved.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || touchMoved.current) return
    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current

    // Geser instan jika arah horizontal dominan dan melampaui 38px
    if (Math.abs(diffX) > 38 && Math.abs(diffX) > Math.abs(diffY) * 1.25) {
      touchMoved.current = true
      if (diffX < 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Deteksi swipe cepat (flick) saat jari diangkat
    if (!touchMoved.current && touchStartX.current !== null && touchStartY.current !== null) {
      const endTouch = e.changedTouches?.[0]
      if (endTouch) {
        const diffX = endTouch.clientX - touchStartX.current
        const diffY = endTouch.clientY - touchStartY.current
        if (Math.abs(diffX) > 32 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
          if (diffX < 0) {
            goToNext()
          } else {
            goToPrev()
          }
        }
      }
    }
    touchStartX.current = null
    touchStartY.current = null
    touchMoved.current = false
  }

  // Jika ceritanya kosong, sembunyikan seluruh bagian "Kisah Cinta"
  if (stories.length === 0) {
    return null
  }

  // Jika hanya ada satu kalimat, tampilkan teks tanpa kontrol slider
  if (stories.length === 1) {
    return (
      <WeddingSection id="story" eyebrow="Perjalanan Kami" title="Kisah Cinta">
        <GlassCard className="story-card single">
          <div className="story-icon-wrap" aria-hidden="true">
            <Sparkles className="text-gold" size={24} />
          </div>
          {stories[0].title.trim() && (
            <h3 className="story-slide-title">
              {parseFormattedText(stories[0].title)}
            </h3>
          )}
          {stories[0].content.trim() && (
            <p className="story-text">{parseFormattedText(stories[0].content)}</p>
          )}
        </GlassCard>
      </WeddingSection>
    )
  }

  // Slider dengan kontrol manual dan indikator posisi
  return (
    <WeddingSection id="story" eyebrow="Perjalanan Kami" title="Kisah Cinta">
      <GlassCard className="story-card">
        {/* Zona sentuh HP: mencakup seluruh area kartu dengan touch-action pan-y */}
        <div
          className="story-card-touch-zone"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="story-icon-wrap" aria-hidden="true">
            <Sparkles className="text-gold" size={24} />
          </div>

          {/* Viewport Slider */}
          <div className="story-slider-viewport">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? 36 : dir < 0 ? -36 : 0,
                    opacity: 0,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (dir: number) => ({
                    x: dir > 0 ? -36 : dir < 0 ? 36 : 0,
                    opacity: 0,
                  }),
                }}
                initial={reduceMotion ? false : 'enter'}
                animate="center"
                exit={reduceMotion ? undefined : 'exit'}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
                }
                className="story-slide"
              >
                {stories[currentIndex].title.trim() && (
                  <h3 className="story-slide-title">
                    {parseFormattedText(stories[currentIndex].title)}
                  </h3>
                )}
                {stories[currentIndex].content.trim() && (
                  <p className="story-text">
                    {parseFormattedText(stories[currentIndex].content)}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Kontrol Navigasi & Indikator Posisi */}
          <div className="story-controls">
            <button
              type="button"
              className="story-nav-btn prev"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              aria-label="Kalimat sebelumnya"
              title="Kalimat sebelumnya"
            >
              <ChevronLeft size={20} />
              <span className="story-nav-btn-text">Sebelumnya</span>
            </button>

            <div className="story-indicator-wrap" aria-live="polite">
              <span className="story-counter">
                {currentIndex + 1} / {stories.length}
              </span>
              <div className="story-dots" aria-hidden="true">
                {stories.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`story-dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Buka slide ${idx + 1}`}
                    tabIndex={-1}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="story-nav-btn next"
              onClick={goToNext}
              disabled={currentIndex === stories.length - 1}
              aria-label="Kalimat berikutnya"
              title="Kalimat berikutnya"
            >
              <span className="story-nav-btn-text">Berikutnya</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </GlassCard>
    </WeddingSection>
  )
}
