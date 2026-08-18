CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  guest_slug TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsvp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('hadir', 'tidak_hadir', 'belum_pasti')),
  guest_count INTEGER DEFAULT 1 CHECK (guest_count BETWEEN 1 AND 10),
  message TEXT,
  ip_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved INTEGER DEFAULT 1 CHECK (approved IN (0, 1)),
  ip_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rsvp_ip_created ON rsvp(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_wishes_approved_created ON wishes(approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_ip_created ON wishes(ip_hash, created_at);
