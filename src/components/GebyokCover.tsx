import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MailOpen, ArrowRight, Heart, Sparkles } from 'lucide-react'
import { weddingConfig as config } from '../config/wedding'
import { LeafDivider } from './UI'

interface GebyokCoverProps {
  guestName: string
  onOpen: () => void
}

export function GebyokCover({ guestName, onOpen }: GebyokCoverProps) {
  // doorState: 'closed' | 'opening' | 'stage_active'
  const [doorState, setDoorState] = useState<'closed' | 'opening' | 'stage_active'>('closed')
  const reduceMotion = useReducedMotion()

  const handleOpenDoors = () => {
    if (doorState !== 'closed') return
    setDoorState('opening')

    // After 3D door inward rotation completes, trigger stage popups
    setTimeout(() => {
      setDoorState('stage_active')
    }, reduceMotion ? 80 : 950)
  }

  const handleEnterInvitation = () => {
    onOpen()
  }

  return (
    <motion.div
      className="gebyok-cover-wrapper"
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.6, ease: 'easeInOut' }}
    >
      <div className="gebyok-backdrop" />

      {/* 3D Perspective Scene */}
      <motion.div
        className="gebyok-perspective-container"
        animate={doorState !== 'closed' ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left Gebyok 3D Door Panel */}
        <motion.div
          className="gebyok-door gebyok-left"
          initial={{ rotateY: 0, translateZ: 0 }}
          animate={
            doorState !== 'closed'
              ? { rotateY: -115, translateZ: -60, opacity: 0.85 }
              : { rotateY: 0, translateZ: 0, opacity: 1 }
          }
          transition={{
            duration: reduceMotion ? 0.2 : 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="gebyok-panel-inner">
            <div className="gebyok-wood-pattern" />
            <div className="gebyok-carving-arch" />
            <div className="gebyok-handle gebyok-handle-left" />
            <div className="gebyok-gold-studs" />
          </div>
        </motion.div>

        {/* Right Gebyok 3D Door Panel */}
        <motion.div
          className="gebyok-door gebyok-right"
          initial={{ rotateY: 0, translateZ: 0 }}
          animate={
            doorState !== 'closed'
              ? { rotateY: 115, translateZ: -60, opacity: 0.85 }
              : { rotateY: 0, translateZ: 0, opacity: 1 }
          }
          transition={{
            duration: reduceMotion ? 0.2 : 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="gebyok-panel-inner">
            <div className="gebyok-wood-pattern" />
            <div className="gebyok-carving-arch" />
            <div className="gebyok-handle gebyok-handle-right" />
            <div className="gebyok-gold-studs" />
          </div>
        </motion.div>

        {/* Cover Plaque Card with Photo Image & Buka Undangan Button */}
        <AnimatePresence>
          {doorState === 'closed' && (
            <motion.div
              className="gebyok-plaque-card"
              initial={{ opacity: 0, scale: 0.88, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.78, y: -30, filter: 'blur(8px)' }}
              transition={{ duration: reduceMotion ? 0.1 : 0.45 }}
            >
              <div className="gebyok-plaque-border" />

              {/* Cover Couple Photo Frame */}
              <div className="cover-photo-vignette">
                <img
                  src={config.groom.photo}
                  alt={`Mempelai ${config.groom.shortName} & ${config.bride.shortName}`}
                  onError={(e) => {
                    e.currentTarget.src = '/images/botanical-hero.png'
                  }}
                />
                <div className="photo-gold-frame-ring" />
              </div>

              <p className="script-gold">The Wedding Of</p>
              <h1 className="gebyok-names">
                {config.groom.shortName} <span className="ampersand">&amp;</span> {config.bride.shortName}
              </h1>

              <LeafDivider />

              <div className="guest-greeting-box">
                <small>Kepada Yth. Bapak/Ibu/Saudara/i</small>
                <strong>{guestName}</strong>
              </div>

              <button
                className="button-gebyok-open"
                onClick={handleOpenDoors}
                aria-label="Buka Undangan Pernikahan"
              >
                <MailOpen size={20} />
                <span>Buka Undangan</span>
                <Sparkles size={16} className="sparkle-icon" />
              </button>

              <p className="gebyok-date-subtitle">
                {config.wedding.day}, {config.wedding.date}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Pop-Up Stage Revealed inside Open Door Perspective */}
        <AnimatePresence>
          {doorState !== 'closed' && (
            <motion.div
              className="popup-stage-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Layer 1: Pohon Gunungan Kayon / Tree of Life */}
              <motion.div
                className="popup-layer popup-gunungan"
                initial={{ opacity: 0, y: 140, scale: 0.55 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.3,
                  duration: reduceMotion ? 0.2 : 0.85,
                  type: 'spring',
                  stiffness: 95,
                  damping: 14,
                }}
              >
                <img
                  src="/assets/gunungan.jpg"
                  onError={(e) => {
                    e.currentTarget.src = '/images/opening-tree-layer.png'
                  }}
                  alt="Gunungan Kayon Jawa"
                />
              </motion.div>

              {/* Layer 2: Rumah Adat Jawa Joglo */}
              <motion.div
                className="popup-layer popup-joglo"
                initial={{ opacity: 0, y: 110, scale: 0.65 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.48,
                  duration: reduceMotion ? 0.2 : 0.8,
                  type: 'spring',
                  stiffness: 115,
                  damping: 15,
                }}
              >
                <img
                  src="/assets/joglo.jpg"
                  onError={(e) => {
                    e.currentTarget.src = '/images/opening-house-layer.png'
                  }}
                  alt="Rumah Adat Jawa Joglo"
                />
              </motion.div>

              {/* Layer 3: Hiasan Daun-daun Tropis */}
              <motion.div
                className="popup-layer popup-leaves"
                initial={{ opacity: 0, y: 90, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.65,
                  duration: reduceMotion ? 0.2 : 0.7,
                }}
              >
                <img
                  src="/images/opening-leaves-layer.png"
                  alt="Hiasan Daun Tropis"
                />
              </motion.div>

              {/* Layer 4: Pop-Up Card Ucapan Selamat Datang ("Sugeng Rawuh") */}
              <motion.div
                className="popup-card-welcome"
                initial={{ opacity: 0, y: 55, scale: 0.88 }}
                animate={
                  doorState === 'stage_active'
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0.8, y: 20, scale: 0.94 }
                }
                transition={{
                  delay: reduceMotion ? 0.1 : 0.75,
                  duration: reduceMotion ? 0.2 : 0.65,
                  type: 'spring',
                  stiffness: 130,
                  damping: 16,
                }}
              >
                <div className="sugeng-rawuh-badge">
                  <Heart size={14} className="text-gold" />
                  <span>Walimatul &apos;Ursy</span>
                </div>

                <h2 className="sugeng-rawuh-title">Sugeng Rawuh</h2>
                <p className="sugeng-rawuh-subtitle">
                  Selamat Datang, Bapak/Ibu/Saudara/i <strong>{guestName}</strong>
                </p>

                <p className="sugeng-rawuh-desc">
                  Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran serta doa restu Anda di hari pernikahan kami.
                </p>

                <div className="sugeng-rawuh-couple">
                  <span>{config.groom.shortName}</span>
                  <i className="text-gold font-serif">&amp;</i>
                  <span>{config.bride.shortName}</span>
                </div>

                <button
                  className="button-sugeng-rawuh-enter"
                  onClick={handleEnterInvitation}
                >
                  <span>Masuk ke Undangan</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
