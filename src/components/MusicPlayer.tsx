import { Music2, Pause, Disc } from 'lucide-react'

interface MusicPlayerProps {
  playing: boolean
  onToggle: () => void
  songTitle?: string
}

export function MusicPlayer({ playing, onToggle, songTitle }: MusicPlayerProps) {
  return (
    <div className="vinyl-player-fixed">
      <button
        className={`vinyl-disc-btn ${playing ? 'is-playing' : 'is-paused'}`}
        onClick={onToggle}
        aria-label={playing ? 'Jeda Musik' : 'Putar Musik'}
        title={songTitle ? `Musik: ${songTitle}` : 'Putar Musik'}
      >
        {/* Concentric Vinyl Grooves Visual */}
        <div className="vinyl-grooves" />

        {/* Center Golden Record Label */}
        <div className="vinyl-label font-serif">
          <Disc size={14} className="text-gold-dark" />
        </div>

        {/* Center Spindle Hole */}
        <div className="vinyl-hole" />

        {/* Center Play / Pause Status Icon */}
        <div className="vinyl-status-icon">
          {playing ? <Pause size={18} /> : <Music2 size={18} />}
        </div>
      </button>

      {/* Floating Sound Waves when playing */}
      {playing && (
        <div className="sound-wave-rings" aria-hidden="true">
          <span className="wave-ring ring-1" />
          <span className="wave-ring ring-2" />
        </div>
      )}
    </div>
  )
}
