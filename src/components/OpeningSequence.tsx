import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { weddingConfig } from '../config/wedding'
import { GebyokCover } from './GebyokCover'

interface OpeningSequenceProps {
  guestName: string
  onStart: () => void
  onComplete: () => void
}

export function OpeningSequence({ guestName, onStart, onComplete }: OpeningSequenceProps) {
  const [phase, setPhase] = useState<'cover' | 'video' | 'complete'>('cover')
  const phaseRef = useRef(phase)
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const locked = phase !== 'complete'

  useEffect(() => {
    if (!locked) return
    const root = document.documentElement
    const body = document.body
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousTouchAction = body.style.touchAction
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    return () => {
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      body.style.touchAction = previousTouchAction
    }
  }, [locked])

  useEffect(() => {
    if (phase === 'video') skipRef.current?.focus({ preventScroll: true })
  }, [phase])

  const finish = () => {
    // A rejected play promise, ended, error, and skip can arrive together.
    if (phaseRef.current !== 'video') return
    phaseRef.current = 'complete'
    videoRef.current?.pause()
    setPhase('complete')
    onComplete()
  }

  const start = () => {
    if (phaseRef.current !== 'cover') return
    phaseRef.current = 'video'
    setPhase('video')
    onStart()
    const video = videoRef.current
    if (!video || video.error) {
      finish()
      return
    }
    try {
      video.muted = true
      video.currentTime = 0
      // Keep play() in the cover click's call stack, including on mobile Safari.
      void video.play().catch(finish)
    } catch {
      finish()
    }
  }

  return (
    <>
      {phase === 'cover' && <GebyokCover guestName={guestName} onOpen={start} />}
      <AnimatePresence>
        {phase !== 'complete' && (
          <motion.section
            className="opening-video-overlay"
            hidden={phase === 'cover'}
            aria-label="Video pembuka undangan"
            role="dialog"
            aria-modal="true"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            <div className="opening-video-frame">
              <video
                ref={videoRef}
                src={weddingConfig.openingVideo.src}
                playsInline
                muted
                controls={false}
                loop={false}
                preload="auto"
                disablePictureInPicture
                onEnded={finish}
                onError={finish}
                aria-label="Video pernikahan"
              />
              <button ref={skipRef} type="button" className="opening-video-skip" onClick={finish}>
                Lewati
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
