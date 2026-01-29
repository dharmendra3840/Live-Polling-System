import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API || 'http://localhost:4000'

export default function PollHistory({ embedded = false }: { embedded?: boolean }) {
  const [polls, setPolls] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get(`${API}/api/polls`)
      .then((r) => setPolls(r.data))
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load poll history'))
  }, [])

  const history = polls.filter((p) => p.status === 'ended')

  return (
    <div className={embedded ? '' : 'p-8'}>
      {!embedded && <h2 className="text-3xl font-semibold mb-6">View Poll History</h2>}
      <div className="space-y-10">
        {error && <div className="text-sm text-red-600">{error}</div>}
        {history.length === 0 && <div className="text-sm text-gray-500">No completed polls yet.</div>}
        {history.map((p, idx) => {
          const total = p.options.reduce((s: number, it: any) => s + (it.votes || 0), 0) || 1
          return (
            <div key={p._id}>
              <div className="text-lg font-semibold">Question {idx + 1}</div>
              <div className="mt-3 max-w-2xl rounded-2xl border border-purple-300">
                <div className="bg-gray-700 text-white px-5 py-3 rounded-t-2xl">{p.question}</div>
                <div className="p-5 space-y-3">
                  {p.options.map((o: any, oIdx: number) => {
                    const pct = Math.round(((o.votes || 0) / total) * 100)
                    return (
                      <div key={o.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-purple-500/80" style={{ width: `${pct}%` }} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">{oIdx + 1}</div>
                            <div className="font-medium">{o.text}</div>
                          </div>
                          <div className="text-sm font-semibold">{pct}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
