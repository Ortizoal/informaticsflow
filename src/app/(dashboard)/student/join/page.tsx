'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinClassPage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setJoining(true)
    setError('')

    // First find the class by join code
    const classesRes = await fetch('/api/classes')
    const classes = await classesRes.json()

    const cls = classes.find((c: any) => c.joinCode === joinCode.toUpperCase())

    if (!cls) {
      setError('Invalid join code')
      setJoining(false)
      return
    }

    const res = await fetch(`/api/classes/${cls.id}/enroll`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
    })

    if (res.ok) {
      router.push(`/student/classes/${cls.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to join')
    }
    setJoining(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Join a Class</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Join Code</label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter the code from your rep"
            className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-widest uppercase"
            maxLength={8}
            required
          />
        </div>
        <button
          type="submit"
          disabled={joining}
          className="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {joining ? 'Joining...' : 'Join Class'}
        </button>
      </form>
    </div>
  )
}
