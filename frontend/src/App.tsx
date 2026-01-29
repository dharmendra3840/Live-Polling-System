import React, { useState } from 'react'
import Teacher from './pages/Teacher'
import Student from './pages/Student'

export default function App() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null)
  const [pendingRole, setPendingRole] = useState<'teacher' | 'student' | null>(null)

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-sm font-semibold">
            <span>✨</span>
            <span>Intervue Poll</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold">Welcome to the <span className="font-extrabold">Live Polling System</span></h1>
          <p className="mt-2 text-gray-500">Please select the role that best describes you to begin using the live polling system</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-6 md:flex-row">
            <button
              className={`w-full md:w-80 rounded-xl border p-6 text-left transition ${pendingRole === 'student' ? 'border-purple-500 shadow-[0_0_0_1px_rgba(124,58,237,0.4)]' : 'border-gray-200'}`}
              onClick={() => setPendingRole('student')}
            >
              <div className="text-lg font-semibold">I’m a Student</div>
              <div className="mt-1 text-sm text-gray-500">Lorem Ipsum is simply dummy text of the printing and typesetting industry</div>
            </button>
            <button
              className={`w-full md:w-80 rounded-xl border p-6 text-left transition ${pendingRole === 'teacher' ? 'border-purple-500 shadow-[0_0_0_1px_rgba(124,58,237,0.4)]' : 'border-gray-200'}`}
              onClick={() => setPendingRole('teacher')}
            >
              <div className="text-lg font-semibold">I’m a Teacher</div>
              <div className="mt-1 text-sm text-gray-500">Submit answers and view live poll results in real-time.</div>
            </button>
          </div>

          <button
            className={`mt-8 rounded-full px-10 py-3 font-semibold text-white ${pendingRole ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gray-300 cursor-not-allowed'}`}
            onClick={() => pendingRole && setRole(pendingRole)}
            disabled={!pendingRole}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  return role === 'teacher' ? <Teacher /> : <Student />
}
