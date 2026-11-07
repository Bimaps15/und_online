import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  CalendarCheck,
  CheckCircle2,
  CircleHelp,
  Heart,
  ImagePlus,
  Italic,
  KeyRound,
  LogOut,
  MessageCircle,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Underline,
  Upload,
  UserCheck,
  UserX,
  Users,
  Calendar,
  CreditCard,
} from 'lucide-react'
import {
  applyWeddingConfig,
  defaultWeddingConfig,
  resetWeddingConfigLocal,
  syncWeddingConfigFromServer,
  weddingConfig,
  type WeddingConfigData,
} from '../config/wedding'
import { parseFormattedText } from '../lib/formatText'
import { Button, Field, GlassCard, Toast } from './UI'

type Stats = {
  totalRsvp: number
  attending: number
  absent: number
  uncertain: number
  totalWishes: number
}

const emptyStats: Stats = {
  totalRsvp: 0,
  attending: 0,
  absent: 0,
  uncertain: 0,
  totalWishes: 0,
}

const EXPECTED_ADMIN_HASH = '4adcf56ae6660c996262fe5defa41cfd2d09cf42cec295d2504b23bd3bb1e807'
const SESSION_TOKEN_KEY = 'wedding_admin_token_hash_v1'

async function sha256Hex(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function compressImageToDataUrl(file: File, maxDimension = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Format gambar tidak didukung'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const webpDataUrl = canvas.toDataURL('image/webp', quality)
        resolve(webpDataUrl.startsWith('data:image/webp') ? webpDataUrl : canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function Admin() {
  const [tokenHash, setTokenHash] = useState<string>(() => {
    try {
      return window.sessionStorage.getItem(SESSION_TOKEN_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'couple' | 'story' | 'gallery' | 'event' | 'gift' | 'stats'>('couple')
  const [formData, setFormData] = useState<WeddingConfigData>(() =>
    JSON.parse(JSON.stringify(weddingConfig)) as WeddingConfigData
  )
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [stats, setStats] = useState<Stats>(emptyStats)
  const [statsUnavailable, setStatsUnavailable] = useState(false)
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({})

  const isAuthenticated = tokenHash === EXPECTED_ADMIN_HASH

  const notify = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3200)
  }

  useEffect(() => {
    void syncWeddingConfigFromServer().then(() => {
      setFormData(JSON.parse(JSON.stringify(weddingConfig)) as WeddingConfigData)
    })
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data: { stats: Stats }) => setStats(data.stats))
      .catch(() => setStatsUnavailable(true))
  }, [isAuthenticated])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const hashed = await sha256Hex(passwordInput.trim())
    if (hashed === EXPECTED_ADMIN_HASH) {
      setTokenHash(hashed)
      try {
        window.sessionStorage.setItem(SESSION_TOKEN_KEY, hashed)
      } catch {
        /* ignore */
      }
      setPasswordInput('')
    } else {
      setLoginError('Password yang Anda masukkan salah.')
    }
  }

  const handleLogout = () => {
    setTokenHash('')
    try {
      window.sessionStorage.removeItem(SESSION_TOKEN_KEY)
    } catch {
      /* ignore */
    }
  }

  const handleUploadPersonPhoto = async (kind: 'groom' | 'bride', e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.84)
      setFormData((prev) => ({
        ...prev,
        [kind]: {
          ...prev[kind],
          photo: dataUrl,
        },
      }))
      notify(`Foto mempelai ${kind === 'groom' ? 'pria' : 'wanita'} siap disimpan`)
    } catch {
      notify('Gagal memproses foto. Coba pilih file gambar lain.')
    } finally {
      e.target.value = ''
    }
  }

  const handleUploadCouplePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImageToDataUrl(file, 1280, 0.84)
      setFormData((prev) => ({ ...prev, couplePhoto: dataUrl }))
      notify('Foto pasangan siap disimpan')
    } catch {
      notify('Gagal memproses foto pasangan.')
    } finally {
      e.target.value = ''
    }
  }

  const handleUploadGalleryPhoto = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImageToDataUrl(file, 1100, 0.82)
      setFormData((prev) => {
        const nextGallery = [...prev.gallery]
        nextGallery[index] = {
          ...nextGallery[index],
          src: dataUrl,
        }
        return { ...prev, gallery: nextGallery }
      })
      notify(`Foto galeri #${index + 1} siap disimpan`)
    } catch {
      notify('Gagal memproses foto galeri.')
    } finally {
      e.target.value = ''
    }
  }

  const handleAddGalleryFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    try {
      const compressedList: { src: string; alt: string }[] = []
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await compressImageToDataUrl(files[i], 1100, 0.82)
        compressedList.push({
          src: dataUrl,
          alt: `Momen ${formData.groom.shortName} dan ${formData.bride.shortName} ${formData.gallery.length + i + 1}`,
        })
      }
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...compressedList],
      }))
      notify(`${compressedList.length} foto galeri baru ditambahkan`)
    } catch {
      notify('Gagal menambahkan foto galeri.')
    } finally {
      e.target.value = ''
    }
  }

  const handleUploadQrisPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.88)
      setFormData((prev) => ({
        ...prev,
        qris: {
          enabled: true,
          image: dataUrl,
        },
      }))
      notify('Gambar QRIS siap disimpan')
    } catch {
      notify('Gagal memproses gambar QRIS.')
    } finally {
      e.target.value = ''
    }
  }

  const handleAddStorySentence = () => {
    setFormData((prev) => ({
      ...prev,
      loveStory: [...(prev.loveStory ?? []), { title: '', content: '' }],
    }))
    notify('Slide baru ditambahkan')
  }

  const handleStoryTitleChange = (index: number, title: string) => {
    setFormData((prev) => {
      const list = [...(prev.loveStory ?? [])]
      const item = list[index] ?? { title: '', content: '' }
      list[index] = { ...item, title }
      return { ...prev, loveStory: list }
    })
  }

  const handleStoryContentChange = (index: number, content: string) => {
    setFormData((prev) => {
      const list = [...(prev.loveStory ?? [])]
      const item = list[index] ?? { title: '', content: '' }
      list[index] = { ...item, content }
      return { ...prev, loveStory: list }
    })
  }

  const handleMoveStoryUp = (index: number) => {
    if (index <= 0) return
    setFormData((prev) => {
      const list = [...(prev.loveStory ?? [])]
      const temp = list[index]
      list[index] = list[index - 1]
      list[index - 1] = temp
      return { ...prev, loveStory: list }
    })
  }

  const handleMoveStoryDown = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.loveStory ?? [])]
      if (index >= list.length - 1) return prev
      const temp = list[index]
      list[index] = list[index + 1]
      list[index + 1] = temp
      return { ...prev, loveStory: list }
    })
  }

  const handleDeleteStory = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.loveStory ?? [])]
      list.splice(index, 1)
      return { ...prev, loveStory: list }
    })
    notify(`Slide #${index + 1} dihapus`)
  }

  const applyFormattingToStory = (index: number, format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRefs.current[index]
    const currentItem = formData.loveStory?.[index] ?? { title: '', content: '' }
    const currentText = currentItem.content ?? ''

    const tagMap = {
      bold: { tag: 'b', placeholder: 'teks tebal' },
      italic: { tag: 'i', placeholder: 'teks miring' },
      underline: { tag: 'u', placeholder: 'teks garis bawah' },
    }

    const { tag, placeholder } = tagMap[format]
    const openTag = `<${tag}>`
    const closeTag = `</${tag}>`

    if (!textarea) {
      const next = currentText ? `${currentText} ${openTag}${placeholder}${closeTag}` : `${openTag}${placeholder}${closeTag}`
      handleStoryContentChange(index, next)
      return
    }

    const start = textarea.selectionStart ?? currentText.length
    const end = textarea.selectionEnd ?? currentText.length
    const selectedText = currentText.substring(start, end)

    let nextText = ''
    let newCursorStart = 0
    let newCursorEnd = 0

    if (selectedText.length > 0) {
      nextText = currentText.substring(0, start) + openTag + selectedText + closeTag + currentText.substring(end)
      newCursorStart = start + openTag.length
      newCursorEnd = newCursorStart + selectedText.length
    } else {
      nextText = currentText.substring(0, start) + openTag + placeholder + closeTag + currentText.substring(end)
      newCursorStart = start + openTag.length
      newCursorEnd = newCursorStart + placeholder.length
    }

    handleStoryContentChange(index, nextText)

    // Kembalikan fokus dan seleksi ke textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    }, 0)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Abaikan slide kosong saat menyimpan dan rapikan spasi
      const cleanedStory = (formData.loveStory ?? [])
        .map((item) => ({
          title: (item.title ?? '').trim(),
          content: (item.content ?? '').trim(),
        }))
        .filter((item) => item.content.length > 0 || item.title.length > 0)

      const payload: WeddingConfigData = {
        ...formData,
        loveStory: cleanedStory,
      }

      setFormData(payload)
      applyWeddingConfig(payload, true)

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Admin-Token': tokenHash,
        },
        body: JSON.stringify({ config: payload }),
      })
      if (response.ok) {
        notify('Semua perubahan berhasil disimpan!')
      } else {
        notify('Perubahan berhasil disimpan di perangkat ini!')
      }
    } catch {
      notify('Perubahan berhasil disimpan di perangkat ini!')
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefault = async () => {
    if (!window.confirm('Kembalikan semua nama dan foto ke pengaturan awal?')) return
    const fresh = resetWeddingConfigLocal()
    setFormData(JSON.parse(JSON.stringify(fresh)) as WeddingConfigData)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Admin-Token': tokenHash,
        },
        body: JSON.stringify({ config: defaultWeddingConfig }),
      })
    } catch {
      /* ignore */
    }
    notify('Data dikembalikan ke pengaturan awal')
  }

  if (!isAuthenticated) {
    return (
      <main className="admin admin-login-screen">
        <GlassCard className="admin-login-card">
          <div className="admin-login-icon">
            <KeyRound size={28} className="text-gold" />
          </div>
          <span className="admin-eyebrow">Admin Dashboard</span>
          <h1>Login Pengelola Undangan</h1>
          <p>Masukkan password admin untuk mengubah nama mempelai, orang tua, dan mengunggah foto undangan.</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <Field label="Password Admin">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan password..."
                required
                autoFocus
              />
            </Field>
            {loginError && <p className="feedback error">{loginError}</p>}
            <Button type="submit" className="w-full justify-center">
              <KeyRound size={17} />
              <span>Masuk ke Dashboard</span>
            </Button>
          </form>

          <a href="/" className="back-link mt-4">
            <ArrowLeft size={16} /> Kembali ke halaman undangan
          </a>
        </GlassCard>
      </main>
    )
  }

  const statCards = [
    [CalendarCheck, 'Total RSVP', stats.totalRsvp],
    [UserCheck, 'Hadir', stats.attending],
    [UserX, 'Tidak Hadir', stats.absent],
    [CircleHelp, 'Belum Pasti', stats.uncertain],
    [MessageCircle, 'Total Ucapan', stats.totalWishes],
  ] as const

  return (
    <main className="admin">
      <div className="admin-topbar">
        <a href="/" className="back-link">
          <ArrowLeft size={18} /> Lihat Undangan
        </a>
        <div className="admin-topbar-actions">
          <button type="button" className="admin-btn-secondary" onClick={handleResetDefault}>
            <RotateCcw size={16} />
            <span>Reset Awal</span>
          </button>
          <button type="button" className="admin-btn-secondary" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <div className="admin-heading">
        <span>Admin Dashboard</span>
        <h1>Kelola Data &amp; Foto Undangan</h1>
        <p>Ubah nama mempelai, nama orang tua, foto profil, foto galeri, hingga rekening hadiah dengan mudah.</p>
      </div>

      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'couple' ? 'active' : ''}`}
          onClick={() => setActiveTab('couple')}
        >
          <Users size={17} />
          <span>Nama &amp; Foto Mempelai</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => setActiveTab('story')}
        >
          <Heart size={17} />
          <span>Kisah Cinta ({(formData.loveStory ?? []).length})</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <ImagePlus size={17} />
          <span>Foto Galeri ({formData.gallery.length})</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'event' ? 'active' : ''}`}
          onClick={() => setActiveTab('event')}
        >
          <Calendar size={17} />
          <span>Tanggal &amp; Lokasi</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'gift' ? 'active' : ''}`}
          onClick={() => setActiveTab('gift')}
        >
          <CreditCard size={17} />
          <span>Rekening &amp; QRIS</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <CalendarCheck size={17} />
          <span>Statistik RSVP</span>
        </button>
      </div>

      {/* TAB 1: MEMPELAI & ORANG TUA */}
      {activeTab === 'couple' && (
        <>
        <GlassCard className="admin-editor-card admin-couple-photo-card">
          <h3>Foto Pasangan</h3>
          <p className="admin-help-text">
            Tampil di bawah nama kedua mempelai pada bagian “The Wedding Of”. Kotak foto otomatis menyesuaikan ukuran foto (portrait maupun landscape). Jika dikosongkan, foto tidak ditampilkan.
          </p>
          <div className="admin-couple-photo-row">
            <div className="admin-couple-photo-preview">
              {formData.couplePhoto ? (
                <img src={formData.couplePhoto} alt="Preview foto pasangan" />
              ) : (
                <span>Belum ada foto</span>
              )}
            </div>
            <div className="admin-couple-photo-fields">
              <label className="admin-upload-btn">
                <Upload size={16} />
                <span>Upload Foto Pasangan</span>
                <input type="file" accept="image/*" hidden onChange={(e) => void handleUploadCouplePhoto(e)} />
              </label>
              <Field label="Atau masukkan URL / path foto">
                <input
                  type="text"
                  placeholder="contoh: /images/couple.webp atau https://..."
                  value={formData.couplePhoto.startsWith('data:') ? '' : formData.couplePhoto}
                  onChange={(e) => setFormData((prev) => ({ ...prev, couplePhoto: e.target.value.trim() }))}
                />
              </Field>
              {formData.couplePhoto && (
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setFormData((prev) => ({ ...prev, couplePhoto: '' }))}
                >
                  <Trash2 size={15} />
                  <span>Hapus Foto Pasangan</span>
                </button>
              )}
            </div>
          </div>
        </GlassCard>
        <div className="admin-grid-2">
          {/* Mempelai Pria */}
          <GlassCard className="admin-editor-card">
            <h3>Mempelai Pria (Groom)</h3>
            <div className="admin-photo-uploader">
              <img
                src={formData.groom.photo}
                alt={formData.groom.name}
                className="admin-photo-preview"
                onError={(e) => {
                  e.currentTarget.src = '/images/botanical-hero.png'
                }}
              />
              <div className="admin-photo-controls">
                <label className="admin-upload-btn">
                  <Upload size={16} />
                  <span>Upload Foto Pria</span>
                  <input
                    type="file"
                    accept="image/*"
                     hidden
                    onChange={(e) => void handleUploadPersonPhoto('groom', e)}
                  />
                </label>
                <small>Format JPG/PNG/WebP. Otomatis dioptimasi.</small>
              </div>
            </div>

            <Field label="Nama Lengkap Mempelai Pria">
              <input
                type="text"
                value={formData.groom.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, groom: { ...prev.groom, name: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Panggilan">
              <input
                type="text"
                value={formData.groom.shortName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, groom: { ...prev.groom, shortName: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Ayah Kandung (tanpa kata Bapak)">
              <input
                type="text"
                value={formData.groom.father}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, groom: { ...prev.groom, father: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Ibu Kandung (tanpa kata Ibu)">
              <input
                type="text"
                value={formData.groom.mother}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, groom: { ...prev.groom, mother: e.target.value } }))
                }
              />
            </Field>
            <Field label="Username Instagram (tanpa @)">
              <input
                type="text"
                value={formData.groom.instagram}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, groom: { ...prev.groom, instagram: e.target.value } }))
                }
              />
            </Field>
          </GlassCard>

          {/* Mempelai Wanita */}
          <GlassCard className="admin-editor-card">
            <h3>Mempelai Wanita (Bride)</h3>
            <div className="admin-photo-uploader">
              <img
                src={formData.bride.photo}
                alt={formData.bride.name}
                className="admin-photo-preview"
                onError={(e) => {
                  e.currentTarget.src = '/images/botanical-hero.png'
                }}
              />
              <div className="admin-photo-controls">
                <label className="admin-upload-btn">
                  <Upload size={16} />
                  <span>Upload Foto Wanita</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => void handleUploadPersonPhoto('bride', e)}
                  />
                </label>
                <small>Format JPG/PNG/WebP. Otomatis dioptimasi.</small>
              </div>
            </div>

            <Field label="Nama Lengkap Mempelai Wanita">
              <input
                type="text"
                value={formData.bride.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bride: { ...prev.bride, name: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Panggilan">
              <input
                type="text"
                value={formData.bride.shortName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bride: { ...prev.bride, shortName: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Ayah Kandung (tanpa kata Bapak)">
              <input
                type="text"
                value={formData.bride.father}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bride: { ...prev.bride, father: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Ibu Kandung (tanpa kata Ibu)">
              <input
                type="text"
                value={formData.bride.mother}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bride: { ...prev.bride, mother: e.target.value } }))
                }
              />
            </Field>
            <Field label="Username Instagram (tanpa @)">
              <input
                type="text"
                value={formData.bride.instagram}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bride: { ...prev.bride, instagram: e.target.value } }))
                }
              />
            </Field>
          </GlassCard>
        </div>
        </>
      )}

      {/* TAB: KISAH CINTA */}
      {activeTab === 'story' && (
        <div className="admin-story-tab">
          <GlassCard className="admin-editor-card">
            <div className="admin-section-header">
              <div>
                <h3>Kelola Kisah Cinta</h3>
                <p>
                  Atur perjalanan cinta yang tampil sebagai slider teks di bawah Rangkaian Acara.
                  Setiap baris mewakili satu slide kalimat. Kolom kosong akan otomatis diabaikan saat disimpan.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={handleAddStorySentence}
              >
                <Plus size={16} />
                <span>Tambah Kalimat</span>
              </button>
            </div>

            {(!formData.loveStory || formData.loveStory.length === 0) ? (
              <div className="admin-story-empty">
                <p>Belum ada kalimat kisah cinta. Jika dikosongkan, bagian Kisah Cinta di undangan publik akan otomatis disembunyikan.</p>
                <button
                  type="button"
                  className="admin-btn-secondary mt-3"
                  onClick={handleAddStorySentence}
                >
                  <Plus size={16} />
                  <span>Tambah Kalimat</span>
                </button>
              </div>
            ) : (
              <div className="admin-story-list">
                {formData.loveStory.map((item, index) => (
                  <div key={index} className="admin-story-item">
                    <div className="admin-story-item-header">
                      <div className="admin-story-badge-wrap">
                        <span className="admin-story-badge">Slide {index + 1}</span>
                        {item.title?.trim() && (
                          <span className="admin-story-title-preview">
                            {item.title}
                          </span>
                        )}
                        <span className="admin-story-count-hint">
                          ({index + 1} / {formData.loveStory.length})
                        </span>
                      </div>
                      <div className="admin-story-item-actions">
                        <button
                          type="button"
                          className="admin-story-action-btn"
                          onClick={() => handleMoveStoryUp(index)}
                          disabled={index === 0}
                          title="Naikkan urutan"
                          aria-label={`Naikkan slide #${index + 1}`}
                        >
                          <ArrowUp size={15} />
                          <span>Naik</span>
                        </button>
                        <button
                          type="button"
                          className="admin-story-action-btn"
                          onClick={() => handleMoveStoryDown(index)}
                          disabled={index === formData.loveStory.length - 1}
                          title="Turunkan urutan"
                          aria-label={`Turunkan slide #${index + 1}`}
                        >
                          <ArrowDown size={15} />
                          <span>Turun</span>
                        </button>
                        <button
                          type="button"
                          className="admin-story-action-btn danger"
                          onClick={() => handleDeleteStory(index)}
                          title="Hapus slide ini"
                          aria-label={`Hapus slide #${index + 1}`}
                        >
                          <Trash2 size={15} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>

                    {/* INPUT HEADING / JUDUL SLIDE */}
                    <Field label={`Heading / Judul Slide #${index + 1}`}>
                      <input
                        type="text"
                        value={item.title ?? ''}
                        onChange={(e) => handleStoryTitleChange(index, e.target.value)}
                        placeholder="Contoh: Awal Pertemuan (bisa dikosongkan jika tidak perlu)"
                      />
                    </Field>

                    <div className="admin-story-field-wrap">
                      <div className="admin-story-toolbar">
                        <span className="admin-toolbar-label">Format:</span>
                        <div className="admin-toolbar-actions">
                          <button
                            type="button"
                            className="admin-toolbar-btn"
                            onClick={() => applyFormattingToStory(index, 'bold')}
                            title="Tebal (Bold) - <b>teks</b>"
                            aria-label={`Format Tebal kalimat ${index + 1}`}
                          >
                            <Bold size={13} />
                            <span>Bold</span>
                          </button>
                          <button
                            type="button"
                            className="admin-toolbar-btn"
                            onClick={() => applyFormattingToStory(index, 'italic')}
                            title="Miring (Italic) - <i>teks</i>"
                            aria-label={`Format Miring kalimat ${index + 1}`}
                          >
                            <Italic size={13} />
                            <span>Italic</span>
                          </button>
                          <button
                            type="button"
                            className="admin-toolbar-btn"
                            onClick={() => applyFormattingToStory(index, 'underline')}
                            title="Garis Bawah (Underscore) - <u>teks</u>"
                            aria-label={`Format Garis Bawah kalimat ${index + 1}`}
                          >
                            <Underline size={13} />
                            <span>Underscore</span>
                          </button>
                        </div>
                      </div>

                      <Field label={`Isi Kalimat #${index + 1}`}>
                        <textarea
                          ref={(el) => {
                            textareaRefs.current[index] = el
                          }}
                          rows={3}
                          value={item.content ?? ''}
                          onChange={(e) => handleStoryContentChange(index, e.target.value)}
                          placeholder="Tuliskan satu kalimat kisah cinta di sini... Sorot teks lalu pilih tombol Bold, Italic, atau Underscore."
                        />
                      </Field>

                      {(item.title?.trim() || item.content?.trim()) && (
                        <div className="admin-story-live-preview">
                          <span className="admin-preview-title">Pratinjau Hasil Slide:</span>
                          {item.title?.trim() && (
                            <h4 className="admin-preview-heading">
                              {parseFormattedText(item.title)}
                            </h4>
                          )}
                          {item.content?.trim() && (
                            <div className="admin-preview-content">
                              {parseFormattedText(item.content)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="admin-story-footer-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleAddStorySentence}
                  >
                    <Plus size={16} />
                    <span>Tambah Kalimat</span>
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 2: GALERI FOTO */}
      {activeTab === 'gallery' && (
        <GlassCard className="admin-editor-card">
          <div className="admin-section-header">
            <div>
              <h3>Kelola Galeri Foto</h3>
              <p>Ganti foto yang ada atau tambahkan foto baru langsung dari HP/Komputer Anda.</p>
            </div>
            <label className="admin-upload-btn">
              <Plus size={17} />
              <span>Tambah Foto Baru</span>
              <input type="file" accept="image/*" multiple hidden onChange={(e) => void handleAddGalleryFiles(e)} />
            </label>
          </div>

          <div className="admin-gallery-grid">
            {formData.gallery.map((item, idx) => (
              <div key={idx} className="admin-gallery-card">
                <div className="admin-gallery-thumb">
                  <img src={item.src} alt={item.alt} />
                  <span className="admin-gallery-badge">#{idx + 1}</span>
                </div>
                <Field label="Keterangan Foto">
                  <input
                    type="text"
                    value={item.alt}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => {
                        const next = [...prev.gallery]
                        next[idx] = { ...next[idx], alt: val }
                        return { ...prev, gallery: next }
                      })
                    }}
                  />
                </Field>
                <div className="admin-gallery-actions">
                  <label className="admin-upload-btn-sm">
                    <Upload size={15} />
                    <span>Ganti Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => void handleUploadGalleryPhoto(idx, e)}
                    />
                  </label>
                  {formData.gallery.length > 1 && (
                    <button
                      type="button"
                      className="admin-delete-btn-sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          gallery: prev.gallery.filter((_, i) => i !== idx),
                        }))
                      }
                      aria-label="Hapus foto ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* TAB 3: TANGGAL & LOKASI ACARA */}
      {activeTab === 'event' && (
        <div className="admin-grid-2">
          <GlassCard className="admin-editor-card">
            <h3>Waktu Pernikahan &amp; Akad Nikah</h3>
            <Field label="Hari Acara (contoh: Senin)">
              <input
                type="text"
                value={formData.wedding.day}
                onChange={(e) => {
                  const day = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    wedding: { ...prev.wedding, day },
                    akad: { ...prev.akad, day },
                    reception: { ...prev.reception, day },
                  }))
                }}
              />
            </Field>
            <Field label="Tanggal Ditampilkan (contoh: 07 Desember 2026)">
              <input
                type="text"
                value={formData.wedding.date}
                onChange={(e) => {
                  const date = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    wedding: { ...prev.wedding, date },
                    akad: { ...prev.akad, date },
                    reception: { ...prev.reception, date },
                  }))
                }}
              />
            </Field>
            <Field label="Waktu Countdown ISO (YYYY-MM-DDTHH:mm:ss+07:00)">
              <input
                type="text"
                value={formData.wedding.isoDate}
                onChange={(e) => {
                  const isoDate = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    wedding: { ...prev.wedding, isoDate },
                    akad: { ...prev.akad, isoDate },
                    reception: { ...prev.reception, isoDate },
                  }))
                }}
              />
            </Field>
            <Field label="Jam Akad Nikah">
              <input
                type="text"
                value={formData.akad.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, akad: { ...prev.akad, time: e.target.value } }))
                }
              />
            </Field>
          </GlassCard>

          <GlassCard className="admin-editor-card">
            <h3>Resepsi &amp; Lokasi Acara</h3>
            <Field label="Jam Resepsi">
              <input
                type="text"
                value={formData.reception.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reception: { ...prev.reception, time: e.target.value } }))
                }
              />
            </Field>
            <Field label="Nama Gedung / Tempat Lokasi">
              <input
                type="text"
                value={formData.reception.location}
                onChange={(e) => {
                  const location = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    akad: { ...prev.akad, location },
                    reception: { ...prev.reception, location },
                  }))
                }}
              />
            </Field>
            <Field label="Alamat Lengkap">
              <textarea
                rows={3}
                value={formData.reception.address}
                onChange={(e) => {
                  const address = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    akad: { ...prev.akad, address },
                    reception: { ...prev.reception, address },
                  }))
                }}
              />
            </Field>
            <Field label="Link Google Maps">
              <input
                type="url"
                value={formData.reception.googleMapsUrl}
                onChange={(e) => {
                  const googleMapsUrl = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    akad: { ...prev.akad, googleMapsUrl },
                    reception: { ...prev.reception, googleMapsUrl },
                  }))
                }}
              />
            </Field>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: REKENING & QRIS */}
      {activeTab === 'gift' && (
        <div className="admin-grid-2">
          {[0, 1].map((idx) => {
            const bankItem = formData.banks[idx] ?? { bank: '', accountNumber: '', accountName: '' }
            return (
              <GlassCard key={idx} className="admin-editor-card">
                <h3>Rekening Bank #{idx + 1}</h3>
                <Field label="Nama Bank (contoh: BCA / SeaBank)">
                  <input
                    type="text"
                    value={bankItem.bank}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => {
                        const next = [...prev.banks]
                        next[idx] = { ...(next[idx] ?? { bank: '', accountNumber: '', accountName: '' }), bank: val }
                        return { ...prev, banks: next }
                      })
                    }}
                  />
                </Field>
                <Field label="Nomor Rekening">
                  <input
                    type="text"
                    value={bankItem.accountNumber}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => {
                        const next = [...prev.banks]
                        next[idx] = {
                          ...(next[idx] ?? { bank: '', accountNumber: '', accountName: '' }),
                          accountNumber: val,
                        }
                        return { ...prev, banks: next }
                      })
                    }}
                  />
                </Field>
                <Field label="Nama Pemilik Rekening (a.n.)">
                  <input
                    type="text"
                    value={bankItem.accountName}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => {
                        const next = [...prev.banks]
                        next[idx] = {
                          ...(next[idx] ?? { bank: '', accountNumber: '', accountName: '' }),
                          accountName: val,
                        }
                        return { ...prev, banks: next }
                      })
                    }}
                  />
                </Field>
              </GlassCard>
            )
          })}

          <GlassCard className="admin-editor-card">
            <h3>QRIS Wedding Gift (Opsional)</h3>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={formData.qris.enabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    qris: { ...prev.qris, enabled: e.target.checked },
                  }))
                }
              />
              <span>Tampilkan QRIS pada pop-up Wedding Gift</span>
            </label>

            {formData.qris.image && (
              <div className="admin-qris-preview">
                <img src={formData.qris.image} alt="Preview QRIS" />
              </div>
            )}

            <div className="admin-photo-controls mt-3">
              <label className="admin-upload-btn">
                <Upload size={16} />
                <span>Upload Gambar QRIS</span>
                <input type="file" accept="image/*" hidden onChange={(e) => void handleUploadQrisPhoto(e)} />
              </label>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: STATISTIK TAMU */}
      {activeTab === 'stats' && (
        <>
          {statsUnavailable && (
            <p className="admin-notice">
              Data statistik dari D1 belum tersedia pada mode preview tanpa database lokal, namun editor foto &amp; nama tetap berfungsi penuh.
            </p>
          )}
          <div className="stats-grid">
            {statCards.map(([Icon, label, value]) => (
              <GlassCard key={label} className="stat-card">
                <Icon />
                <span>{label}</span>
                <strong>{value}</strong>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* FLOATING / STICKY SAVE BAR */}
      <div className="admin-save-bar">
        <div className="admin-save-info">
          <CheckCircle2 size={18} className="text-gold" />
          <span>Pastikan menekan tombol simpan setelah mengubah nama atau mengunggah foto.</span>
        </div>
        <Button type="button" onClick={() => void handleSaveAll()} disabled={saving}>
          <Save size={18} />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </Button>
      </div>

      {toast && <Toast message={toast} />}
    </main>
  )
}
