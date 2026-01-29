import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import usePollTimer from '../hooks/usePollTimer'
import ChatPopup from '../components/ChatPopup'
import PollHistory from './PollHistory'

const API = import.meta.env.VITE_API || 'https://live-polling-system-backend-q439.onrender.com'

export default function Teacher() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [optionCorrect, setOptionCorrect] = useState<(boolean | null)[]>([null, null])
  const [duration, setDuration] = useState(60)
  const [polls, setPolls] = useState<any[]>([])
  const [socket, setSocket] = useState<any>(null)
  const [activePoll, setActivePoll] = useState<any | null>(null)
  const joinedPollIdRef = useRef<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [socketError, setSocketError] = useState<string | null>(null)
  const [systemError, setSystemError] = useState<string | null>(null)

  useEffect(() => {
    const s = io(API)
    setSocket(s)

    const handlePollState = (data: any) => {
      const poll = data.poll || {}
      setActivePoll({ ...poll, __serverTime: data.serverTime })
      if (poll?._id && joinedPollIdRef.current !== poll._id) {
        joinedPollIdRef.current = poll._id
        s.emit('join_room', { pollId: poll._id, role: 'teacher' })
      }
    }
    const handleVoteUpdate = (data: any) => setActivePoll({ ...(data.poll || {}), __serverTime: Date.now() })
    const handleParticipants = (data: any) => setParticipants(data.participants || [])
    const handlePollError = (data: any) => setSystemError(data?.error || 'server error')
    const handleConnect = () => setSocketError(null)
    const handleDisconnect = () => setSocketError('disconnected from server')
    const handleConnectError = () => setSocketError('unable to connect to server')

    s.on('poll_state', handlePollState)
    s.on('vote_update', handleVoteUpdate)
    s.on('participants_update', handleParticipants)
    s.on('poll_error', handlePollError)
    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('connect_error', handleConnectError)
    s.emit('request_state', {}, (res: any) => {
      if (res && res.ok === false && res.error && res.error !== 'no active poll') {
        setSystemError(res.error)
      }
    })

    return () => {
      s.off('poll_state', handlePollState)
      s.off('vote_update', handleVoteUpdate)
      s.off('participants_update', handleParticipants)
      s.off('poll_error', handlePollError)
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('connect_error', handleConnectError)
      s.disconnect()
    }
  }, [])
  const [participants, setParticipants] = useState<any[]>([])

  async function create() {
    if (!question || options.filter(Boolean).length < 2) return alert('enter question and at least 2 options')
    try {
      const res = await axios.post(`${API}/api/polls`, { 
        question, 
        options: options.filter(Boolean), 
        optionCorrect: optionCorrect.slice(0, options.filter(Boolean).length),
        duration 
      })
      setPolls((prev) => [res.data, ...prev])
      return res.data
    } catch (err: any) {
      console.error('Failed to create poll', err)
      const msg = err?.response?.data?.error || 'Failed to create poll'
      setSystemError(msg)
      alert(msg)
      return null
    }
  }

  async function start(id: string) {
    try {
      const res = await axios.post(`${API}/api/polls/${id}/start`)
      socket.emit('join_room', { pollId: id, role: 'teacher' })
      socket.emit('poll_started', { poll: res.data })
      setActivePoll({ ...(res.data || {}), __serverTime: Date.now() })
      alert('Poll started')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to start poll'
      setSystemError(msg)
      alert(msg)
    }
  }

  async function askQuestion() {
    const created = await create()
    if (!created?._id) return
    await start(created._id)
    setQuestion('')
    setOptions(['', ''])
    setOptionCorrect([null, null])
  }

  useEffect(() => {
    axios.get(`${API}/api/polls`).then((r) => setPolls(r.data))
  }, [])

  const serverTime = activePoll?.__serverTime
  const startTime = activePoll?.startTime
  const activeDuration = activePoll?.duration
  const { remaining } = usePollTimer(startTime, activeDuration, serverTime)

  useEffect(() => {
    const pollId = activePoll?._id
    if (!socket || !pollId) return
    if (typeof remaining !== 'number') return
    if (remaining > 0) return
    socket.emit('request_state', { pollId }, () => {})
  }, [socket, activePoll, remaining])

  const totalVotes = activePoll?.options?.reduce((sum: number, o: any) => sum + (o?.votes || 0), 0) || 0

  if (showHistory) {
    return (
      <div className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">View Poll History</h2>
            <button className="rounded-full bg-purple-600 text-white px-6 py-2" onClick={() => setShowHistory(false)}>Back to Polls</button>
          </div>
          <div className="mt-8">
            <PollHistory embedded />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-sm font-semibold">
            <span>✨</span>
            <span>Intervue Poll</span>
          </div>
          <button className="rounded-full bg-purple-600 text-white px-6 py-2 flex items-center gap-2" onClick={() => setShowHistory(true)}>
            <span>👁</span>
            <span>View Poll history</span>
          </button>
        </div>

        {(socketError || systemError) && <div className="mt-4 text-sm text-red-600">{socketError || systemError}</div>}

        {!activePoll ? (
          <>
            <div className="mt-6">
              <h2 className="text-3xl font-semibold">Let's Get Started</h2>
              <p className="mt-2 text-gray-500">you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm font-semibold">Enter your question</div>
              <select
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <textarea
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Type your question here..."
                maxLength={100}
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="mt-2 text-right text-xs text-gray-400">{question.length}/100</div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Edit Options</div>
                <div className="text-sm font-semibold">Is it Correct?</div>
              </div>
              <div className="space-y-3">
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
                      <input
                        className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                        placeholder={`Option ${i + 1}`}
                        value={o}
                        onChange={(e) => setOptions((s) => s.map((v, idx) => (idx === i ? e.target.value : v)))}
                      />
                    </div>
                    <div className="flex items-center gap-6 text-sm flex-shrink-0">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={optionCorrect[i] === true}
                          onChange={() => setOptionCorrect((s) => s.map((v, idx) => (idx === i ? true : v)))}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={optionCorrect[i] === false}
                          onChange={() => setOptionCorrect((s) => s.map((v, idx) => (idx === i ? false : v)))}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  className="mt-2 rounded-lg border border-purple-400 text-purple-600 px-4 py-2 text-sm"
                  onClick={() => {
                    setOptions((s) => [...s, ''])
                    setOptionCorrect((s) => [...s, null])
                  }}
                >
                  + Add More option
                </button>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button className="rounded-full bg-purple-600 text-white px-10 py-3" onClick={askQuestion}>Ask Question</button>
            </div>
          </>
        ) : (
          <div className="mt-12">
            <div className="text-lg font-semibold mb-6">Question</div>
            <div className="max-w-3xl rounded-2xl border border-purple-300 overflow-hidden">
              <div className="bg-gray-700 text-white px-6 py-4 rounded-t-2xl font-semibold">{activePoll.question}</div>
              <div className="p-6 space-y-4">
                {activePoll.options?.map((o: any, idx: number) => {
                  const pct = totalVotes ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0
                  return (
                    <div key={o.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0 font-semibold">{o.text.charAt(0).toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="relative w-full h-10 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                          <div className="absolute left-0 top-0 h-full bg-purple-600" style={{ width: `${pct}%` }} />
                          <div className="absolute inset-0 flex items-center px-4">
                            <span className="text-gray-800 font-medium">{o.text}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold min-w-12 text-right">{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button 
                className="rounded-full bg-purple-600 text-white px-8 py-3 font-semibold"
                onClick={() => setActivePoll(null)}
              >
                + Ask a new question
              </button>
            </div>
          </div>
        )}
      </div>

      {socket && activePoll && (
        <ChatPopup
          socket={socket}
          pollId={activePoll._id}
          sessionId={'teacher'}
          participants={participants}
          onKick={(sessionId) => socket.emit('kick_participant', { pollId: activePoll._id, sessionId })}
        />
      )}
    </div>
  )
}
