import { motion, useReducedMotion } from 'framer-motion'
import { MailOpen, Sparkles } from 'lucide-react'
import { weddingConfig as config } from '../config/wedding'
import { LeafDivider } from './UI'

interface GebyokCoverProps {
  guestName: string
  onOpen: () => void
}

export function GebyokCover({ guestName, onOpen }: GebyokCoverProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="gebyok-cover-wrapper"
      transition={{ duration: reduceMotion ? 0.1 : 0.6, ease: 'easeInOut' }}
    >
      <div className="gebyok-backdrop" />

      {/* 3D Perspective Scene */}
      <motion.div
        className="gebyok-perspective-container"
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left Gebyok 3D Door Panel */}
        <motion.div
          className="gebyok-door gebyok-left"
          initial={{ rotateY: 0, translateZ: 0 }}
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
        <motion.div
          className="gebyok-plaque-card"
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.45 }}
        >
          <div className="gebyok-plaque-border" />

          {/* Cover Floral Emblem Frame */}
          <div className="cover-photo-vignette">
            <img
              src="/images/cover-flower.jpg"
              alt="Ornamen Bunga Pernikahan"
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
            onClick={onOpen}
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
      </motion.div>
    </motion.div>
  )
}
