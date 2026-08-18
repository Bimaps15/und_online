import { Menu, X, Gift, CheckSquare } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  onOpenGift?: () => void
  onOpenRSVP?: () => void
  onOpenMap?: () => void
}

export function Navbar({ onOpenGift, onOpenRSVP, onOpenMap }: NavbarProps) {
  const [open, setOpen] = useState(false)

  const items = [
    { id: 'home', label: 'Beranda' },
    { id: 'couple', label: 'Mempelai' },
    { id: 'event', label: 'Acara' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'location', label: 'Lokasi' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'wishes', label: 'Ucapan' },
    { id: 'gift', label: 'Hadiah' },
  ]

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    setOpen(false)
    if (id === 'gift' && onOpenGift) {
      e.preventDefault()
      onOpenGift()
    } else if (id === 'rsvp' && onOpenRSVP) {
      e.preventDefault()
      onOpenRSVP()
    } else if (id === 'location' && onOpenMap) {
      e.preventDefault()
      onOpenMap()
    }
  }

  return (
    <header className="navbar">
      <a className="brand" href="#home">
        B <span>&amp;</span> A
      </a>

      <nav className={open ? 'open' : ''} aria-label="Navigasi utama">
        {items.map(({ id, label }) => (
          <a key={id} href={`#${id}`} onClick={(e) => handleNavClick(id, e)}>
            {label}
          </a>
        ))}
      </nav>

      <div className="navbar-quick-actions">
        {onOpenRSVP && (
          <button
            className="nav-action-btn"
            onClick={onOpenRSVP}
            title="Buka Form RSVP"
            aria-label="RSVP Pop-Up"
          >
            <CheckSquare size={16} />
            <span className="hidden-mobile">RSVP</span>
          </button>
        )}
        {onOpenGift && (
          <button
            className="nav-action-btn nav-action-gift"
            onClick={onOpenGift}
            title="Amplop Digital"
            aria-label="Amplop Digital Pop-Up"
          >
            <Gift size={16} />
            <span className="hidden-mobile">Kirim Hadiah</span>
          </button>
        )}
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}


