import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import usePollTimer from '../hooks/usePollTimer'
import ChatPopup from '../components/ChatPopup'

const API = import.meta.env.VITE_API || 'https://live-polling-system-backend-q439.onrender.com'

export default function Student() {
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const [socket, setSocket] = useState<any>(null)
  const [poll, setPoll] = useState<any | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const joinedPollIdRef = useRef<string | null>(null)
  const lastPollIdRef = useRef<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [socketError, setSocketError] = useState<string | null>(null)
  const [systemError, setSystemError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [kicked, setKicked] = useState(false)

  const getSessionItem = (key: string) => {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  const setSessionItem = (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value)
    } catch {
    }
    }
  }

  useEffect(() => {
    const s = io(API, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })
    setSocket(s)

    const handleConnect = () => {
      setSocketError(null)
      console.log('✅ Socket.IO connected')
    }
    const handleDisconnect = () => {
      setSocketError('Socket.IO disconnected')
      console.warn('⚠️ Socket.IO disconnected')
    }
    const handleConnectError = (error: any) => {
      setSocketError(`Socket.IO error: ${error.message || 'connection failed'}`)
      console.error('❌ Socket.IO connection error:', error)
    }
    const handlePollError = (data: any) => setSystemError(data?.error || 'server error')
    const handleKicked = () => setKicked(true)
    const handleParticipants = (data: any) => setParticipants(data?.participants || [])

    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('connect_error', handleConnectError)
    s.on('poll_error', handlePollError)
    s.on('kicked', handleKicked)
    s.on('participants_update', handleParticipants)

    return () => {
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('connect_error', handleConnectError)
      s.off('poll_error', handlePollError)
      s.off('kicked', handleKicked)
      s.off('participants_update', handleParticipants)
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    const savedName = getSessionItem('name')
    const savedSessionId = getSessionItem('sessionId')
    if (savedName) setName(savedName)
    if (savedSessionId) {
      setSessionId(savedSessionId)
      if (savedName) setJoined(true)
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    const handlePollState = (data: any) => {
      const nextPoll = data?.poll
      if (!nextPoll) {
        setPoll(null)
        return
      }
      if (lastPollIdRef.current !== nextPoll._id) {
        lastPollIdRef.current = nextPoll._id
        setHasVoted(false)
      }
      setPoll({ ...nextPoll, __serverTime: data?.serverTime })
      setSelected(null)
    }
    const handleVoteUpdate = (data: any) => setPoll({ ...(data.poll || {}), __serverTime: Date.now() })

    socket.on('poll_state', handlePollState)
    socket.on('vote_update', handleVoteUpdate)

    return () => {
      socket.off('poll_state', handlePollState)
      socket.off('vote_update', handleVoteUpdate)
    }
  }, [socket, sessionId, name])

  useEffect(() => {
    if (!socket || !joined || !sessionId) return
    socket.emit('join_room', { role: 'student', sessionId, name })
    socket.emit('request_state', {}, (res: any) => {
      if (res && res.ok === false && res.error && res.error !== 'no active poll') {
        setSystemError(res.error)
      }
    })
  }, [socket, joined, sessionId, name])

  useEffect(() => {
    const pollId = (poll as any)?._id
    if (!socket || !sessionId || !pollId) return
    if (joinedPollIdRef.current === pollId) return
    joinedPollIdRef.current = pollId
    socket.emit('join_room', { pollId, role: 'student', sessionId, name })
  }, [socket, sessionId, name, poll])

  const serverTime = (poll as any)?.__serverTime
  const startTime = (poll as any)?.startTime
  const duration = (poll as any)?.duration
  const { remaining } = usePollTimer(startTime, duration, serverTime)
  const isActive = (poll as any)?.status === 'active' && remaining > 0
  const canVote = isActive && !hasVoted && !isSubmitting
  const showResults = hasVoted || !isActive

  useEffect(() => {
    const pollId = (poll as any)?._id
    if (!socket || !pollId) return
    if (typeof remaining !== 'number') return
    if (remaining > 0) return
    socket.emit('request_state', { pollId }, () => {})
  }, [socket, poll, remaining])

  function join() {
    if (!name.trim()) return alert('enter name')
    const existing = getSessionItem('sessionId')
    const nextSessionId = existing || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setSessionItem('sessionId', nextSessionId)
    setSessionItem('name', name)
    setSessionId(nextSessionId)
    setJoined(true)
  }

  function submit() {
    if (!sessionId || !selected || !poll || !canVote) return
    setIsSubmitting(true)
    setHasVoted(true)
    setSystemError(null)
    const pollId = poll._id
    setPoll((prev: any) => {
      if (!prev) return prev
      const nextOptions = prev.options.map((o: any) => (o.id === selected ? { ...o, votes: (o.votes || 0) + 1 } : o))
      return { ...prev, options: nextOptions }
    })
    socket.emit('submit_vote', { pollId: poll._id, optionId: selected, sessionId }, (res: any) => {
      setIsSubmitting(false)
      if (!res?.ok) {
        const errMsg = res?.error || 'error'
        if (errMsg !== 'already voted') {
          setHasVoted(false)
        }
        setSystemError(errMsg)
        socket.emit('request_state', { pollId }, () => {})
        alert(errMsg)
      }
    })
  }

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-sm font-semibold">
            <span>✨</span>
            <span>Intervue Poll</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold">Let’s Get Started</h2>
          <p className="mt-2 text-gray-500">If you’re a student, you’ll be able to <span className="font-semibold text-gray-700">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates</p>
          <div className="mt-8">
            <div className="text-sm font-semibold mb-2">Enter your Name</div>
            <input className="border border-gray-200 bg-gray-50 rounded-lg p-3 w-80" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mt-6">
            <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full" onClick={join}>Continue</button>
          </div>
        </div>
      </div>
    )
  }

  if (kicked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-sm font-semibold">
            <span>✨</span>
            <span>Intervue Poll</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold">You’ve been Kicked out !</h2>
          <p className="mt-2 text-gray-500">Looks like the teacher had removed you from the poll system. Please Try again sometime.</p>
        </div>
      </div>
    )
  }

  if (!poll || !poll.options?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-sm font-semibold">
            <span>✨</span>
            <span>Intervue Poll</span>
          </div>
          <div className="mt-6 text-5xl text-purple-600">◐</div>
          <div className="mt-4 text-xl font-semibold">Wait for the teacher to ask questions..</div>
          {(socketError || systemError) && <div className="mt-2 text-sm text-red-600">{socketError || systemError}</div>}
        </div>
        <ChatPopup socket={socket} pollId={poll?._id} sessionId={sessionId || 'student'} participants={participants} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {(socketError || systemError) && <div className="mb-4 text-sm text-red-600">{socketError || systemError}</div>}
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span>Question 1</span>
          <span className="text-sm text-gray-500">⏱</span>
          <span className="text-red-500 text-sm">{remaining !== undefined ? `00:${String(remaining).padStart(2, '0')}` : ''}</span>
        </div>

        <div className="mt-4 max-w-2xl rounded-2xl border border-purple-300">
          <div className="bg-gray-700 text-white px-5 py-3 rounded-t-2xl">{poll.question}</div>
          <div className="p-5 space-y-3">
            {poll.options.map((o: any, idx: number) => {
              const total = poll.options.reduce((s: number, it: any) => s + (it.votes || 0), 0) || 1
              const pct = Math.round(((o.votes || 0) / total) * 100)
              if (showResults) {
                return (
                  <div key={o.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-purple-500/80" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">{idx + 1}</div>
                        <div className="font-medium">{o.text}</div>
                      </div>
                      <div className="text-sm font-semibold">{pct}%</div>
                    </div>
                  </div>
                )
              }
              return (
                <div
                  key={o.id}
                  className={`rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center justify-between ${selected === o.id ? 'ring-2 ring-purple-400' : ''} ${canVote ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                  onClick={() => canVote && setSelected(o.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full text-xs flex items-center justify-center ${selected === o.id ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white'}`}>{idx + 1}</div>
                    <div className="font-medium">{o.text}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {!showResults && (
          <div className="mt-6 flex justify-end max-w-2xl">
            <button
              className={`bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full ${!canVote || !selected ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={submit}
              disabled={!canVote || !selected}
            >
              Submit
            </button>
          </div>
        )}

        {showResults && (
          <div className="mt-6 text-center text-lg font-semibold">Wait for the teacher to ask a new question..</div>
        )}
      </div>

      {socket && poll && (
        <ChatPopup socket={socket} pollId={poll._id} sessionId={sessionId || 'student'} participants={participants} />
      )}
    </div>
  )
}
