import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GuestIdentityProvider } from './hooks/GuestIdentityProvider'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(<StrictMode><GuestIdentityProvider><App /></GuestIdentityProvider></StrictMode>)
