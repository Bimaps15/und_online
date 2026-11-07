import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { guestIdentityFromUrl } from '../lib/guestIdentity'

type GuestState = { name: string; valid: boolean; loading: boolean }
const GuestContext = createContext<GuestState>({ name: '', valid: false, loading: true })
export function GuestIdentityProvider({ children }: { children: ReactNode }) {
  const [guest, setGuest] = useState<GuestState>(() => {
    const identity = guestIdentityFromUrl(new URL(window.location.href))
    return { name: identity?.name ?? '', valid: !!identity, loading: !!identity }
  })
  useEffect(() => {
    const controller = new AbortController()
    if (!guestIdentityFromUrl(new URL(window.location.href))) return
    void fetch('/api/guest', { signal: controller.signal, referrerPolicy: 'same-origin', headers: { accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error('Guest unavailable')
        const data = await response.json() as { success: boolean; name?: string }
        if (data.success && data.name) setGuest({ name: data.name, valid: true, loading: false })
        else setGuest({ name: '', valid: false, loading: false })
      })
      .catch(() => { if (!controller.signal.aborted) setGuest(current => ({ ...current, loading: false })) })
    return () => controller.abort()
  }, [])
  return <GuestContext.Provider value={guest}>{children}</GuestContext.Provider>
}
// Shared by the cover, inline forms, and RSVP modal.
// eslint-disable-next-line react-refresh/only-export-components
export function useGuestIdentity() { return useContext(GuestContext) }
