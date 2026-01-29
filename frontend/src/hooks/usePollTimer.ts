import { useEffect, useState } from 'react'

// startTime: server epoch ms when poll started
// duration: seconds
// serverTime: server epoch ms returned alongside startTime to compute client offset
export default function usePollTimer(startTime: number | undefined, duration: number | undefined, serverTime: number | undefined) {
  const [remaining, setRemaining] = useState<number>(duration ?? 0)

  useEffect(() => {
    if (!startTime || !duration) return

    const now = Date.now()
    // compute approximate client-server offset
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
