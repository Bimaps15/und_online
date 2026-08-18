import { motion } from 'framer-motion'
import { ZoomIn } from 'lucide-react'
import { weddingConfig } from '../config/wedding'
import { WeddingSection } from './UI'

interface GalleryProps {
  onSelectPhoto?: (index: number) => void
}

export function Gallery({ onSelectPhoto }: GalleryProps) {
  return (
    <WeddingSection id="gallery" eyebrow="Al-Bi With You" title="Galeri Momen">
      <p className="section-intro">
        Kenangan indah dalam setiap langkah perjalanan cinta kami menuju ikatan suci pernikahan.
      </p>

      <div className="gallery-grid">
        {weddingConfig.gallery.map((image, index) => (
          <motion.button
            key={image.alt + index}
            className="gallery-item-card"
            onClick={() => onSelectPhoto && onSelectPhoto(index)}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 220, damping: 15 }}
            aria-label={`Buka pratinjau ${image.alt}`}
          >
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
            <div className="gallery-hover-overlay">
              <ZoomIn size={24} className="text-gold" />
              <span>Lihat Foto</span>
            </div>
          </motion.button>
        ))}
      </div>
    </WeddingSection>
  )
}
