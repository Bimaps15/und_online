import { useEffect, useMemo, useRef, useState, useCallback, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  ChevronUp,
  X,
  CreditCard,
  PieChart,
  ArrowLeft,
} from 'lucide-react'
import { weddingConfig } from '../config/wedding'
import { GlassCard, LeafDivider, Toast } from './UI'

export interface BudgetItem {
  id: string
  name: string
  category: string
  estimated: number
  paid: number
  dueDate?: string
  note?: string
  status?: 'belum' | 'dp' | 'lunas'
}

export interface BudgetData {
  couple: {
    bride: string
    groom: string
    weddingDate: string
  }
  targetBudget: number
  items: BudgetItem[]
  updatedAt: string
}

const STORE_KEY = 'budgetNikahSheetData'
const URL_KEY = 'budgetNikahScriptUrl'
const LAST_LOCAL_SAVE_KEY = 'budgetNikahLastLocalSaveAt'

const CATEGORIES = [
  'Semua',
  'Seserahan',
  'Mahar & Mas Kawin',
  'Venue',
  'Konsumsi',
  'Dekorasi',
  'Busana',
  'Dokumentasi',
  'Undangan & Souvenir',
  'Hiburan',
  'Lainnya',
] as const

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const defaultSeed: BudgetData = {
  couple: {
    bride: weddingConfig.bride.shortName || 'Alviana',
    groom: weddingConfig.groom.shortName || 'Bima',
    weddingDate: weddingConfig.wedding.isoDate.split('T')[0] || '2026-12-07',
  },
  targetBudget: 75000000,
  items: [
    {
      id: 'item-1',
      name: 'Paket Box Hias Seserahan & Mahar Akrilik',
      category: 'Seserahan',
      estimated: 3500000,
      paid: 3500000,
      dueDate: '2026-11-20',
      note: '8 Box Akrilik Premium + Tray Kayu Ukir',
      status: 'lunas',
    },
    {
      id: 'item-2',
      name: 'Set Perlengkapan Ibadah (Mukena Silk & Sajadah)',
      category: 'Seserahan',
      estimated: 1800000,
      paid: 1800000,
      dueDate: '2026-11-15',
      note: 'Mukena sutra armany + Al-Quran custom nama',
      status: 'lunas',
    },
    {
      id: 'item-3',
      name: 'Set Perawatan Kulit & Skincare Premium',
      category: 'Seserahan',
      estimated: 2200000,
      paid: 2200000,
      dueDate: '2026-11-10',
      note: 'Paket lengkap skincare & parfum',
      status: 'lunas',
    },
    {
      id: 'item-4',
      name: 'Sepatu, Tas Pesta & Busana Seserahan',
      category: 'Seserahan',
      estimated: 2500000,
      paid: 2500000,
      dueDate: '2026-11-12',
      note: 'Nuansa sage emerald & gold',
      status: 'lunas',
    },
    {
      id: 'item-5',
      name: 'Gedung & Venue (Endah Residence 2)',
      category: 'Venue',
      estimated: 25000000,
      paid: 10000000,
      dueDate: '2026-11-01',
      note: 'DP 40% sudah lunas, pelunasan H-14',
      status: 'dp',
    },
    {
      id: 'item-6',
      name: 'Katering & Konsumsi (500 Porsi)',
      category: 'Konsumsi',
      estimated: 30000000,
      paid: 15000000,
      dueDate: '2026-11-25',
      note: 'Menu utama + 5 gubukan khas Jawa',
      status: 'dp',
    },
    {
      id: 'item-7',
      name: 'Dekorasi Gebyok Modern Emerald & Pelaminan',
      category: 'Dekorasi',
      estimated: 12000000,
      paid: 5000000,
      dueDate: '2026-11-10',
      note: 'Nuansa botanical, gebyok ukir, bunga segar',
      status: 'dp',
    },
    {
      id: 'item-8',
      name: 'Tata Rias MUA & Busana Pengantin Adat',
      category: 'Busana',
      estimated: 8500000,
      paid: 8500000,
      dueDate: '2026-10-30',
      note: 'Akad & resepsi lengkap beskap & paes',
      status: 'lunas',
    },
    {
      id: 'item-9',
      name: 'Dokumentasi Foto & Video Sinematik',
      category: 'Dokumentasi',
      estimated: 6000000,
      paid: 3000000,
      dueDate: '2026-11-15',
      note: 'Drone, album kolase + teaser reels',
      status: 'dp',
    },
    {
      id: 'item-10',
      name: 'Undangan Digital & Souvenir Tamu',
      category: 'Undangan & Souvenir',
      estimated: 2500000,
      paid: 2500000,
      dueDate: '2026-10-15',
      note: 'Web invitation + 250 custom souvenir pouch',
      status: 'lunas',
    },
  ],
  updatedAt: new Date().toISOString(),
}

const fmtIDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatRupiah(num: number): string {
  return fmtIDR.format(num || 0)
}

function parseMoney(value: string | number): number {
  return Number(String(value || '').replace(/[^0-9]/g, '') || 0)
}

function formatDateIndo(value: string): string {
  if (!value) return '-'
  try {
    const d = new Date(`${value}T00:00:00`)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function getItemStatus(item: BudgetItem): 'belum' | 'dp' | 'lunas' {
  if (item.status) return item.status
  if (item.estimated > 0 && item.paid >= item.estimated) return 'lunas'
  if (item.paid > 0) return 'dp'
  return 'belum'
}

export function BudgetSeserahanTracker({
  notify,
  compact = false,
}: {
  notify?: (msg: string) => void
  compact?: boolean
}) {
  const [data, setData] = useState<BudgetData>(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.items && Array.isArray(parsed.items)) return parsed
      }
    } catch {
      /* ignore */
    }
    return defaultSeed
  })

  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    return localStorage.getItem(URL_KEY) || ''
  })

  const [syncStatus, setSyncStatus] = useState<{
    text: string
    type: 'online' | 'offline' | 'syncing' | 'idle'
  }>({
    text: scriptUrl ? 'Tersambung Google Sheet' : 'Penyimpanan Lokal Aktif',
    type: scriptUrl ? 'online' : 'offline',
  })

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState<string>('Semua')
  const [statusFilter, setStatusFilter] = useState<'semua' | 'belum' | 'dp' | 'lunas'>('semua')
  const [searchQuery, setSearchQuery] = useState('')

  // UI Accordions / Panels
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCloudSync, setShowCloudSync] = useState(false)
  const [showBackup, setShowBackup] = useState(false)

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [quickPayItem, setQuickPayItem] = useState<BudgetItem | null>(null)
  const [quickPayAmount, setQuickPayAmount] = useState('')

  // New Item Form State
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Seserahan')
  const [newEstimated, setNewEstimated] = useState('')
  const [newPaid, setNewPaid] = useState('0')
  const [newDueDate, setNewDueDate] = useState('')
  const [newNote, setNewNote] = useState('')

  // Settings State
  const [targetBudgetInput, setTargetBudgetInput] = useState(
    Number(data.targetBudget || 75000000).toLocaleString('id-ID')
  )
  const [brideName, setBrideName] = useState(data.couple?.bride || weddingConfig.bride.shortName)
  const [groomName, setGroomName] = useState(data.couple?.groom || weddingConfig.groom.shortName)
  const [weddingDateInput, setWeddingDateInput] = useState(
    data.couple?.weddingDate || weddingConfig.wedding.isoDate.split('T')[0]
  )

  // Backup state
  const [backupJson, setBackupJson] = useState('')

  const syncTimerRef = useRef<number | null>(null)

  const inform = useCallback(
    (msg: string) => {
      if (notify) notify(msg)
    },
    [notify]
  )

  // Save to LocalStorage + Push to Google Sheet
  const saveData = (nextData: BudgetData, shouldPush = true) => {
    const updated: BudgetData = {
      ...nextData,
      updatedAt: new Date().toISOString(),
    }
    setData(updated)
    const now = Date.now()
    localStorage.setItem(LAST_LOCAL_SAVE_KEY, String(now))
    localStorage.setItem(STORE_KEY, JSON.stringify(updated))

    if (shouldPush) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      syncTimerRef.current = window.setTimeout(() => {
        pushToSheet(updated)
      }, 500)
    }
  }

  // Push payload to Google Apps Script Web App
  const pushToSheet = (payloadData: BudgetData) => {
    const cleanUrl = (localStorage.getItem(URL_KEY) || '').trim().replace(/\/+$/, '')
    if (!cleanUrl) {
      setSyncStatus({ text: 'Tersimpan lokal', type: 'offline' })
      return
    }

    setSyncStatus({ text: 'Menyimpan ke Cloud...', type: 'syncing' })
    try {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = cleanUrl
      form.target = 'budget_sheet_sink'
      form.style.display = 'none'
      form.innerHTML = `
        <input name="action" value="save">
        <textarea name="payload"></textarea>
      `
      const ta = form.querySelector('textarea')
      if (ta) ta.value = JSON.stringify(payloadData)
      document.body.append(form)
      form.submit()
      form.remove()

      window.setTimeout(() => {
        setSyncStatus({ text: 'Tersinkron Google Sheet', type: 'online' })
      }, 1000)
    } catch {
      setSyncStatus({ text: 'Gagal sync ke Sheet', type: 'offline' })
    }
  }

  // Pull data from Google Apps Script Web App
  const pullFromSheet = useCallback((silent = false) => {
    const cleanUrl = (localStorage.getItem(URL_KEY) || '').trim().replace(/\/+$/, '')
    if (!cleanUrl) {
      if (!silent) inform('Masukkan URL Google Apps Script terlebih dahulu.')
      return
    }

    if (!silent) setSyncStatus({ text: 'Mengambil data...', type: 'syncing' })
    const callbackName = `budgetSheetCallback_${generateId()}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)[callbackName] = (response: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName]
      document.querySelector(`[data-jsonp="${callbackName}"]`)?.remove()

      if (!response || !response.ok) {
        if (!silent) {
          setSyncStatus({ text: 'Gagal ambil data', type: 'offline' })
          inform(response?.error || 'Data Google Sheet tidak dapat dibaca.')
        }
        return
      }

      const incoming = response.data as BudgetData
      if (incoming && incoming.items) {
        setData(incoming)
        localStorage.setItem(STORE_KEY, JSON.stringify(incoming))
        setSyncStatus({ text: 'Tersinkron Google Sheet', type: 'online' })
        if (!silent) inform('Data berhasil diperbarui dari Google Sheet!')
      }
    }

    const script = document.createElement('script')
    script.src = `${cleanUrl}?action=read&callback=${callbackName}&t=${Date.now()}`
    script.dataset.jsonp = callbackName
    script.onerror = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName]
      script.remove()
      if (!silent) {
        setSyncStatus({ text: 'Koneksi Sheet Gagal', type: 'offline' })
        inform('Gagal menghubungi Google Sheet. Periksa izin URL Web App Anda.')
      }
    }
    document.body.append(script)
  }, [inform])

  // Handle URL Save
  const handleSaveUrl = () => {
    const clean = scriptUrl.trim().replace(/\/+$/, '')
    localStorage.setItem(URL_KEY, clean)
    if (clean) {
      setSyncStatus({ text: 'URL tersimpan', type: 'online' })
      inform('URL Google Sheet tersimpan. Mengambil data terbaru...')
      pullFromSheet(false)
    } else {
      setSyncStatus({ text: 'Penyimpanan Lokal Aktif', type: 'offline' })
      inform('Mode penyimpanan lokal diaktifkan.')
    }
  }

  // Auto-pull on interval
  useEffect(() => {
    const url = localStorage.getItem(URL_KEY)
    if (url) {
      pullFromSheet(true)
      const interval = window.setInterval(() => {
        pullFromSheet(true)
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [pullFromSheet])

  // Calculate Metrics
  const summary = useMemo(() => {
    const totalEst = data.items.reduce((acc, item) => acc + (Number(item.estimated) || 0), 0)
    const totalPaid = data.items.reduce((acc, item) => acc + (Number(item.paid) || 0), 0)
    const remaining = Math.max(totalEst - totalPaid, 0)
    const target = Number(data.targetBudget) || 0
    const leftFromTarget = target - totalEst
    const percentage = totalEst > 0 ? Math.min(Math.round((totalPaid / totalEst) * 100), 100) : 0

    // Seserahan specific subtotal
    const seserahanItems = data.items.filter(
      (it) => it.category === 'Seserahan' || it.category === 'Mahar & Mas Kawin'
    )
    const seserahanEst = seserahanItems.reduce((acc, it) => acc + (Number(it.estimated) || 0), 0)
    const seserahanPaid = seserahanItems.reduce((acc, it) => acc + (Number(it.paid) || 0), 0)

    return {
      totalEst,
      totalPaid,
      remaining,
      target,
      leftFromTarget,
      percentage,
      seserahanEst,
      seserahanPaid,
      totalCount: data.items.length,
      lunasCount: data.items.filter((it) => getItemStatus(it) === 'lunas').length,
    }
  }, [data])

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return data.items.filter((item) => {
      const matchCat = activeCategory === 'Semua' || item.category === activeCategory
      const status = getItemStatus(item)
      const matchStatus = statusFilter === 'semua' || status === statusFilter
      const textHaystack = `${item.name} ${item.category} ${item.note || ''}`.toLowerCase()
      const matchQuery = !q || textHaystack.includes(q)
      return matchCat && matchStatus && matchQuery
    })
  }, [data.items, activeCategory, statusFilter, searchQuery])

  // Add Item
  const handleAddItem = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const est = parseMoney(newEstimated)
    const pd = Math.min(parseMoney(newPaid), est)
    const st: 'belum' | 'dp' | 'lunas' = pd >= est && est > 0 ? 'lunas' : pd > 0 ? 'dp' : 'belum'

    const newItem: BudgetItem = {
      id: generateId(),
      name: newName.trim(),
      category: newCategory,
      estimated: est,
      paid: pd,
      dueDate: newDueDate || '',
      note: newNote.trim(),
      status: st,
    }

    const nextItems = [newItem, ...data.items]
    saveData({ ...data, items: nextItems })

    setNewName('')
    setNewEstimated('')
    setNewPaid('0')
    setNewDueDate('')
    setNewNote('')
    setShowAddForm(false)
    inform(`Pos "${newItem.name}" berhasil ditambahkan!`)
  }

  // Delete Item
  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Hapus pos pengeluaran "${name}"?`)) {
      const nextItems = data.items.filter((it) => it.id !== id)
      saveData({ ...data, items: nextItems })
      inform(`Pos "${name}" telah dihapus.`)
    }
  }

  // Quick Pay
  const handleOpenQuickPay = (item: BudgetItem) => {
    setQuickPayItem(item)
    setQuickPayAmount(Number(item.paid || 0).toLocaleString('id-ID'))
  }

  const handleSaveQuickPay = (e: FormEvent) => {
    e.preventDefault()
    if (!quickPayItem) return

    const paidVal = Math.min(parseMoney(quickPayAmount), quickPayItem.estimated)
    const newStatus: 'belum' | 'dp' | 'lunas' =
      paidVal >= quickPayItem.estimated && quickPayItem.estimated > 0
        ? 'lunas'
        : paidVal > 0
        ? 'dp'
        : 'belum'

    const nextItems = data.items.map((it) => {
      if (it.id === quickPayItem.id) {
        return {
          ...it,
          paid: paidVal,
          status: newStatus,
        }
      }
      return it
    })

    saveData({ ...data, items: nextItems })
    inform(`Pembayaran "${quickPayItem.name}" diperbarui: ${formatRupiah(paidVal)}`)
    setQuickPayItem(null)
  }

  // Mark Full Paid
  const handleMarkLunas = (item: BudgetItem) => {
    const nextItems = data.items.map((it) => {
      if (it.id === item.id) {
        return {
          ...it,
          paid: it.estimated,
          status: 'lunas' as const,
        }
      }
      return it
    })
    saveData({ ...data, items: nextItems })
    inform(`"${item.name}" ditandai Lunas!`)
  }

  // Edit Item Modal Save
  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const est = parseMoney(editingItem.estimated)
    const pd = Math.min(parseMoney(editingItem.paid), est)
    const st: 'belum' | 'dp' | 'lunas' = pd >= est && est > 0 ? 'lunas' : pd > 0 ? 'dp' : 'belum'

    const nextItems = data.items.map((it) => {
      if (it.id === editingItem.id) {
        return {
          ...editingItem,
          estimated: est,
          paid: pd,
          status: st,
        }
      }
      return it
    })

    saveData({ ...data, items: nextItems })
    inform(`Perubahan "${editingItem.name}" berhasil disimpan.`)
    setEditingItem(null)
  }

  // Save Settings
  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault()
    const nextData: BudgetData = {
      ...data,
      couple: {
        bride: brideName.trim() || 'Alviana',
        groom: groomName.trim() || 'Bima',
        weddingDate: weddingDateInput,
      },
      targetBudget: parseMoney(targetBudgetInput),
    }
    saveData(nextData)
    setShowSettings(false)
    inform('Pengaturan target & pasangan berhasil disimpan.')
  }

  // Backup Actions
  const handleExport = () => {
    const jsonStr = JSON.stringify(data, null, 2)
    setBackupJson(jsonStr)
    navigator.clipboard?.writeText(jsonStr)
    inform('Data JSON telah disalin ke clipboard!')
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(backupJson)
      if (!parsed || !parsed.items || !Array.isArray(parsed.items)) {
        throw new Error('Format JSON backup tidak valid.')
      }
      saveData(parsed)
      inform('Data berhasil di-import dari backup!')
    } catch (err) {
      alert((err as Error).message || 'Gagal import backup data.')
    }
  }

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Kembalikan ke data contoh awal? Perubahan saat ini akan ditimpa dengan template default.'
      )
    ) {
      saveData(defaultSeed)
      inform('Data berhasil dikembalikan ke default template.')
    }
  }

  return (
    <div className={`budget-tracker-root ${compact ? 'compact-mode' : ''}`}>
      {/* Hidden iframe for Google Sheet Form POST */}
      <iframe
        name="budget_sheet_sink"
        title="budget_sheet_sink"
        style={{ display: 'none', width: 0, height: 0 }}
      />

      {/* HEADER BAR & STATUS */}
      <div className="budget-header-bar">
        <div className="budget-title-wrap">
          <div className="budget-icon-pill">
            <Wallet size={20} className="text-gold" />
            <span className="script-gold-sm">Wedding Planner &amp; Seserahan</span>
          </div>
          <h3>
            Budget &amp; Seserahan {data.couple?.groom} &amp; {data.couple?.bride}
          </h3>
          <p className="budget-date-badge">
            <Calendar size={13} />
            <span>
              Target Hari H:{' '}
              {data.couple?.weddingDate ? formatDateIndo(data.couple.weddingDate) : 'Belum diatur'}
            </span>
          </p>
        </div>

        <div className="budget-header-actions">
          <div className={`budget-sync-pill status-${syncStatus.type}`} title={syncStatus.text}>
            <span className="sync-dot" />
            <span className="sync-text">{syncStatus.text}</span>
            {syncStatus.type === 'syncing' && <RefreshCw size={12} className="animate-spin" />}
          </div>

          <div className="budget-action-btn-group">
            <button
              className="budget-btn-tool"
              onClick={() => setShowCloudSync(!showCloudSync)}
              title="Koneksi Google Sheet"
              aria-label="Koneksi Google Sheet"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden-mobile">Google Sheet</span>
            </button>
            <button
              className="budget-btn-tool"
              onClick={() => setShowSettings(!showSettings)}
              title="Pengaturan Target & Pasangan"
              aria-label="Pengaturan"
            >
              <PieChart size={16} />
              <span className="hidden-mobile">Target</span>
            </button>
            <button
              className="budget-btn-tool"
              onClick={() => setShowBackup(!showBackup)}
              title="Backup & Restore"
              aria-label="Backup"
            >
              <Download size={16} />
              <span className="hidden-mobile">Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE: GOOGLE SHEET SYNC DRAWER */}
      <AnimatePresence>
        {showCloudSync && (
          <motion.div
            className="budget-drawer-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-gold" />
                <h4>Koneksi Google Sheet Cloud</h4>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setShowCloudSync(false)}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>
            <p className="drawer-desc">
              Hubungkan kalkulator ini dengan Google Sheet melalui URL Web App Google Apps Script
              agar data otomatis tersinkron antar HP calon pengantin dan keluarga.
            </p>
            <div className="sync-input-row">
              <input
                type="url"
                placeholder="Tempel URL Web App Google Apps Script (https://script.google.com/...)"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                className="budget-input"
              />
              <button className="button-gold-sm" onClick={handleSaveUrl}>
                <Check size={14} /> Simpan URL
              </button>
              <button className="button-outline-sm" onClick={() => pullFromSheet(false)}>
                <RefreshCw size={14} /> Ambil Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COLLAPSIBLE: SETTINGS DRAWER */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="budget-drawer-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <PieChart size={18} className="text-gold" />
                <h4>Pengaturan Pasangan &amp; Target Budget</h4>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setShowSettings(false)}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="settings-grid">
              <div className="field-group">
                <label>Nama Calon Pria</label>
                <input
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="budget-input"
                  required
                />
              </div>
              <div className="field-group">
                <label>Nama Calon Wanita</label>
                <input
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="budget-input"
                  required
                />
              </div>
              <div className="field-group">
                <label>Tanggal Pernikahan</label>
                <input
                  type="date"
                  value={weddingDateInput}
                  onChange={(e) => setWeddingDateInput(e.target.value)}
                  className="budget-input"
                />
              </div>
              <div className="field-group">
                <label>Target Plafon Budget (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetBudgetInput}
                  onChange={(e) =>
                    setTargetBudgetInput(parseMoney(e.target.value).toLocaleString('id-ID'))
                  }
                  className="budget-input"
                  required
                />
              </div>
              <div className="col-span-full flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="button-outline-sm"
                  onClick={() => setShowSettings(false)}
                >
                  Batal
                </button>
                <button type="submit" className="button-gold-sm">
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COLLAPSIBLE: BACKUP DRAWER */}
      <AnimatePresence>
        {showBackup && (
          <motion.div
            className="budget-drawer-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-gold" />
                <h4>Backup &amp; Restore Data</h4>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setShowBackup(false)}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>
            <p className="drawer-desc">
              Ekspor seluruh data budget &amp; seserahan ke format teks JSON untuk dicadangkan, atau
              tempel data JSON dari HP lain untuk diimpor.
            </p>
            <textarea
              className="budget-textarea"
              rows={4}
              placeholder="Tekan 'Ekspor JSON' untuk membuat cadangan, atau tempel teks JSON di sini lalu tekan 'Impor JSON'..."
              value={backupJson}
              onChange={(e) => setBackupJson(e.target.value)}
            />
            <div className="backup-actions">
              <button className="button-gold-sm" onClick={handleExport}>
                <Download size={14} /> Ekspor JSON (Salin)
              </button>
              <button className="button-outline-sm" onClick={handleImport}>
                <Upload size={14} /> Impor JSON
              </button>
              <button className="button-danger-sm" onClick={handleResetToDefault}>
                <RotateCcw size={14} /> Reset ke Default
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY STATS METRICS */}
      <div className="budget-metrics-grid">
        <div className="budget-metric-card primary-stat">
          <span className="metric-label">Total Estimasi Biaya</span>
          <strong className="metric-value">{formatRupiah(summary.totalEst)}</strong>
          <span className="metric-sub">
            {summary.totalCount} Pos Biaya ({summary.lunasCount} Lunas)
          </span>
        </div>

        <div className="budget-metric-card">
          <span className="metric-label">Sudah Dibayar</span>
          <strong className="metric-value text-emerald-400">
            {formatRupiah(summary.totalPaid)}
          </strong>
          <span className="metric-sub">Progress: {summary.percentage}% Terbayar</span>
        </div>

        <div className="budget-metric-card">
          <span className="metric-label">Sisa Tagihan</span>
          <strong className="metric-value text-amber-300">
            {formatRupiah(summary.remaining)}
          </strong>
          <span className="metric-sub">Harus dilunasi jelang Hari H</span>
        </div>

        <div className="budget-metric-card">
          <span className="metric-label">Sisa Plafon Target</span>
          <strong
            className={`metric-value ${
              summary.leftFromTarget < 0 ? 'text-rose-400' : 'text-emerald-300'
            }`}
          >
            {formatRupiah(summary.leftFromTarget)}
          </strong>
          <span className="metric-sub">
            Target Plafon: {formatRupiah(summary.target)}
            {summary.leftFromTarget < 0 && ' (Over budget!)'}
          </span>
        </div>
      </div>

      {/* SESERAHAN HIGHLIGHT STRIP */}
      <div className="seserahan-highlight-banner">
        <div className="seserahan-highlight-info">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold" />
            <strong className="text-gold">Pos Seserahan &amp; Mahar:</strong>
          </div>
          <span>
            Estimasi <b>{formatRupiah(summary.seserahanEst)}</b> | Terbayar{' '}
            <b>{formatRupiah(summary.seserahanPaid)}</b>
          </span>
        </div>
        <button
          className="seserahan-filter-shortcut"
          onClick={() => {
            setActiveCategory('Seserahan')
          }}
        >
          Lihat Seserahan ({data.items.filter((i) => i.category === 'Seserahan').length})
        </button>
      </div>

      {/* OVERALL PROGRESS BAR */}
      <div className="budget-progress-card">
        <div className="progress-header">
          <span>Realisasi Pembayaran Budget</span>
          <strong className="text-gold">{summary.percentage}%</strong>
        </div>
        <div className="budget-progress-track">
          <motion.div
            className="budget-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${summary.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* CONTROLS: CATEGORIES, SEARCH, STATUS FILTER & ADD BUTTON */}
      <div className="budget-controls-section">
        {/* Category Pills Bar */}
        <div className="category-scroll-bar" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
            >
              {cat}
              {cat !== 'Semua' && (
                <span className="cat-count">
                  {data.items.filter((i) => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter & Action Row */}
        <div className="budget-toolbar-row">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari item, vendor, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="budget-search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-status-group">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'semua' | 'belum' | 'dp' | 'lunas')
              }
              className="budget-select"
            >
              <option value="semua">Semua Status</option>
              <option value="belum">Belum Bayar</option>
              <option value="dp">DP (Sebagian)</option>
              <option value="lunas">Lunas</option>
            </select>
          </div>

          <button
            className="button-add-pos"
            onClick={() => setShowAddForm(!showAddForm)}
            aria-expanded={showAddForm}
          >
            {showAddForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            <span>Tambah Pos</span>
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE ADD ITEM FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleAddItem}
            className="budget-add-card"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
          >
            <div className="form-card-title">
              <Plus size={18} className="text-gold" />
              <h4>Tambah Pos Pengeluaran / Seserahan Baru</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="field-label">Nama Pengeluaran / Barang Seserahan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Paket 8 Box Seserahan & Mahar Akrilik"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="budget-input"
                  required
                />
              </div>

              <div>
                <label className="field-label">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="budget-select"
                >
                  {CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Estimasi Biaya / Harga (Rp) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={newEstimated}
                  onChange={(e) =>
                    setNewEstimated(parseMoney(e.target.value).toLocaleString('id-ID'))
                  }
                  className="budget-input"
                  required
                />
              </div>

              <div>
                <label className="field-label">Sudah Dibayar Saat Ini (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={newPaid}
                  onChange={(e) => setNewPaid(parseMoney(e.target.value).toLocaleString('id-ID'))}
                  className="budget-input"
                />
              </div>

              <div>
                <label className="field-label">Jatuh Tempo Pembayaran</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="budget-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="field-label">Catatan / Vendor / Spesifikasi</label>
                <input
                  type="text"
                  placeholder="Contoh: No HP vendor, DP 50%, alamat pengambilan..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="budget-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="button-outline-sm"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </button>
              <button type="submit" className="button-gold-sm">
                <Plus size={16} /> Simpan Pos Biaya
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ITEMS LIST */}
      <div className="budget-items-list">
        {filteredItems.length === 0 ? (
          <div className="budget-empty-state">
            <Layers size={36} className="text-sage opacity-50 mb-2" />
            <p>Tidak ada pos biaya yang sesuai dengan filter atau pencarian Anda.</p>
            <button
              className="button-outline-sm mt-2"
              onClick={() => {
                setActiveCategory('Semua')
                setStatusFilter('semua')
                setSearchQuery('')
              }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const status = getItemStatus(item)
            const remaining = Math.max(item.estimated - item.paid, 0)
            const itemPct =
              item.estimated > 0
                ? Math.min(Math.round((item.paid / item.estimated) * 100), 100)
                : 0

            return (
              <motion.div
                key={item.id}
                className="budget-item-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <div className="item-header">
                  <div>
                    <span className="item-category-tag">{item.category}</span>
                    <h4 className="item-name">{item.name}</h4>
                  </div>
                  <span className={`item-badge badge-${status}`}>
                    {status === 'lunas' ? 'Lunas' : status === 'dp' ? 'DP' : 'Belum Bayar'}
                  </span>
                </div>

                <div className="item-financials-grid">
                  <div className="fin-col">
                    <span className="fin-label">Estimasi</span>
                    <strong className="fin-val">{formatRupiah(item.estimated)}</strong>
                  </div>
                  <div className="fin-col">
                    <span className="fin-label">Dibayar</span>
                    <strong className="fin-val text-emerald-400">
                      {formatRupiah(item.paid)}
                    </strong>
                  </div>
                  <div className="fin-col">
                    <span className="fin-label">Sisa Tagihan</span>
                    <strong className="fin-val text-amber-300">
                      {formatRupiah(remaining)}
                    </strong>
                  </div>
                </div>

                {/* Progress bar per item */}
                <div className="item-progress-track">
                  <div className="item-progress-fill" style={{ width: `${itemPct}%` }} />
                </div>

                {/* Notes & Due Date */}
                {(item.dueDate || item.note) && (
                  <div className="item-meta-row">
                    {item.dueDate && (
                      <span className="meta-due">
                        <Calendar size={13} /> Tempo: {formatDateIndo(item.dueDate)}
                      </span>
                    )}
                    {item.note && <span className="meta-note">{item.note}</span>}
                  </div>
                )}

                {/* Card Actions */}
                <div className="item-actions-row">
                  {status !== 'lunas' && (
                    <button
                      className="item-btn-quickpay"
                      onClick={() => handleMarkLunas(item)}
                      title="Tandai Lunas"
                    >
                      <CheckCircle2 size={14} />
                      <span>Lunas</span>
                    </button>
                  )}
                  <button
                    className="item-btn-action"
                    onClick={() => handleOpenQuickPay(item)}
                    title="Update Pembayaran"
                  >
                    <CreditCard size={14} />
                    <span>Bayar</span>
                  </button>
                  <button
                    className="item-btn-action"
                    onClick={() => setEditingItem(item)}
                    title="Edit Data Pos"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="item-btn-delete"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    title="Hapus Pos"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* QUICK PAY MODAL */}
      <AnimatePresence>
        {quickPayItem && (
          <div className="modal-backdrop-fixed" role="dialog" aria-modal="true">
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickPayItem(null)}
            />
            <motion.div
              className="modal-container-glass max-w-md p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div>
                  <span className="script-gold-sm">Update Pembayaran</span>
                  <h3 className="text-xl font-bold text-cream">{quickPayItem.name}</h3>
                </div>
                <button
                  onClick={() => setQuickPayItem(null)}
                  className="text-white/60 hover:text-white"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuickPay} className="space-y-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
                  <div className="flex justify-between text-sage">
                    <span>Estimasi Biaya:</span>
                    <strong className="text-cream">{formatRupiah(quickPayItem.estimated)}</strong>
                  </div>
                  <div className="flex justify-between text-sage">
                    <span>Sudah Dibayar Sebelumnya:</span>
                    <strong className="text-emerald-400">
                      {formatRupiah(quickPayItem.paid)}
                    </strong>
                  </div>
                </div>

                <div>
                  <label className="field-label">Total yang Sudah Dibayar Saat Ini (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quickPayAmount}
                    onChange={(e) =>
                      setQuickPayAmount(parseMoney(e.target.value).toLocaleString('id-ID'))
                    }
                    className="budget-input text-lg font-bold text-gold"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-white/10 text-sage hover:text-white"
                      onClick={() =>
                        setQuickPayAmount(
                          Number(quickPayItem.estimated / 2).toLocaleString('id-ID')
                        )
                      }
                    >
                      DP 50%
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-white/10 text-sage hover:text-white"
                      onClick={() =>
                        setQuickPayAmount(Number(quickPayItem.estimated).toLocaleString('id-ID'))
                      }
                    >
                      Lunas 100%
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    className="button-outline-sm"
                    onClick={() => setQuickPayItem(null)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="button-gold-sm">
                    Simpan Pembayaran
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL EDIT MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="modal-backdrop-fixed" role="dialog" aria-modal="true">
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
            />
            <motion.div
              className="modal-container-glass max-w-lg p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div>
                  <span className="script-gold-sm">Edit Pos Pengeluaran</span>
                  <h3 className="text-xl font-bold text-cream">{editingItem.name}</h3>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-white/60 hover:text-white"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="field-label">Nama Pos Pengeluaran</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="budget-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Kategori</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category: e.target.value })
                      }
                      className="budget-select"
                    >
                      {CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Estimasi Harga (Rp)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={Number(editingItem.estimated || 0).toLocaleString('id-ID')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          estimated: parseMoney(e.target.value),
                        })
                      }
                      className="budget-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Sudah Dibayar (Rp)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={Number(editingItem.paid || 0).toLocaleString('id-ID')}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          paid: parseMoney(e.target.value),
                        })
                      }
                      className="budget-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">Jatuh Tempo</label>
                    <input
                      type="date"
                      value={editingItem.dueDate || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, dueDate: e.target.value })
                      }
                      className="budget-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">Catatan / Keterangan Vendor</label>
                  <textarea
                    rows={2}
                    value={editingItem.note || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                    className="budget-textarea"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    className="button-outline-sm"
                    onClick={() => setEditingItem(null)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="button-gold-sm">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function BudgetSeserahanSection({ notify }: { notify: (msg: string) => void }) {
  return (
    <section id="seserahan" className="wedding-section budget-section">
      <div className="section-heading">
        <span>Kalkulator &amp; Rencana Persiapan</span>
        <h2>Budget &amp; Seserahan</h2>
        <LeafDivider />
      </div>
      <p className="section-intro">
        Pantau realisasi anggaran pernikahan, daftar seserahan, mahar, serta jadwal pelunasan
        vendor secara praktis dan otomatis tersinkronisasi.
      </p>

      <GlassCard className="budget-glass-card">
        <BudgetSeserahanTracker notify={notify} />
      </GlassCard>
    </section>
  )
}

export function SeserahanPage() {
  const [toast, setToast] = useState('')

  const notify = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3000)
  }

  return (
    <main className="admin seserahan-page-standalone">
      <div className="flex items-center justify-between mb-4">
        <a href="/" className="back-link">
          <ArrowLeft size={18} /> Kembali ke Undangan
        </a>
      </div>

      <div className="admin-heading mb-6">
        <span>Wedding Preparation</span>
        <h1>Budget &amp; Seserahan Planner</h1>
        <p>Kalkulator dan checklist persiapan pernikahan {weddingConfig.groom.shortName} &amp; {weddingConfig.bride.shortName}</p>
      </div>

      <GlassCard className="budget-glass-card">
        <BudgetSeserahanTracker notify={notify} />
      </GlassCard>

      {toast && <Toast message={toast} />}
    </main>
  )
}

