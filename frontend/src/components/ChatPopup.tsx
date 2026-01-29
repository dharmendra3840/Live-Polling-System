import React, { useEffect, useState } from 'react'

type Participant = { sessionId: string; name?: string }

export default function ChatPopup({
  socket,
  pollId,
  sessionId,
  participants = [],
  onKick
}: {
  socket: any
  pollId: string
  sessionId: string
  participants?: Participant[]
  onKick?: (sessionId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [tab, setTab] = useState<'chat' | 'participants'>('chat')

  useEffect(() => {
    if (!socket) return
    const handler = (data: any) => setMessages((m) => [...m, data])
    socket.on('chat_message', handler)
    return () => socket.off('chat_message', handler)
  }, [socket])

  function send() {
    if (!socket || !text) return
    socket.emit('chat_message', { pollId, sessionId, message: text })
    setText('')
  }

  return (
    <div className="fixed right-8 bottom-8">
      {open && (
        <div className="w-96 h-[420px] bg-white shadow-lg rounded-2xl border border-gray-200">
          <div className="flex items-center gap-6 px-5 pt-4">
            <button className={`text-sm font-semibold ${tab === 'chat' ? 'text-black border-b-2 border-purple-500 pb-2' : 'text-gray-400'}`} onClick={() => setTab('chat')}>
              Chat
            </button>
            <button className={`text-sm font-semibold ${tab === 'participants' ? 'text-black border-b-2 border-purple-500 pb-2' : 'text-gray-400'}`} onClick={() => setTab('participants')}>
              Participants
            </button>
          </div>

          {tab === 'chat' ? (
            <div className="px-5 pb-4">
              <div className="mt-3 h-64 overflow-auto space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="text-sm">
                    <div className="text-xs text-purple-600 font-semibold">{m.sessionId}</div>
                    <div className={`inline-block rounded-2xl px-3 py-2 ${m.sessionId === sessionId ? 'bg-purple-600 text-white' : 'bg-gray-800 text-white'}`}>
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input className="flex-1 border rounded-xl px-3 py-2 text-sm" value={text} onChange={(e) => setText(e.target.value)} />
                <button className="px-3 rounded-xl bg-purple-600 text-white text-sm" onClick={send}>Send</button>
              </div>
            </div>
          ) : (
            <div className="px-5 pb-4">
              <div className="mt-3 text-xs text-gray-400 flex justify-between">
                <span>Name</span>
                {onKick && <span>Action</span>}
              </div>
              <div className="mt-2 max-h-64 overflow-auto space-y-3">
                {participants.length === 0 && <div className="text-sm text-gray-400">No participants yet.</div>}
                {participants.map((p) => (
                  <div key={p.sessionId} className="flex justify-between text-sm">
                    <span>{p.name || p.sessionId}</span>
                    {onKick && <button className="text-purple-600" onClick={() => onKick(p.sessionId)}>Kick out</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <button className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg" onClick={() => setOpen((v) => !v)}>💬</button>
    </div>
  )
}
