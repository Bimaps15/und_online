import { useEffect, useState } from 'react'

type Countdown = { days: number; hours: number; minutes: number; seconds: number; complete: boolean }

function calculate(target: string): Countdown {
  const distance = Math.max(0, new Date(target).getTime() - Date.now())
  return { days: Math.floor(distance / 86400000), hours: Math.floor(distance / 3600000) % 24, minutes: Math.floor(distance / 60000) % 60, seconds: Math.floor(distance / 1000) % 60, complete: distance === 0 }
}

export function useCountdown(target: string) {
  const [countdown, setCountdown] = useState(() => calculate(target))
  useEffect(() => { const timer = window.setInterval(() => setCountdown(calculate(target)), 1000); return () => window.clearInterval(timer) }, [target])
  return countdown
}
