import { useEffect, useState } from 'react'

export default function usePollTimer(startTime: number | undefined, duration: number | undefined, serverTime: number | undefined) {
  const [remaining, setRemaining] = useState<number>(duration ?? 0)

  useEffect(() => {
    if (!startTime || !duration) return

    const now = Date.now()
    const offset = serverTime ? now - serverTime : 0
    const computeRemaining = () => Math.max(0, Math.round(duration - (Date.now() - startTime - offset) / 1000))

    setRemaining(computeRemaining())

    const t = setInterval(() => {
      setRemaining(computeRemaining())
    }, 500)

    return () => clearInterval(t)
  }, [startTime, duration, serverTime])

  return { remaining }
}
