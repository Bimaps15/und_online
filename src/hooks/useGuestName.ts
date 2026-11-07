import { useGuestIdentity } from './GuestIdentityProvider'

export function useGuestName() {
  return useGuestIdentity().name || 'Tamu Undangan'
}