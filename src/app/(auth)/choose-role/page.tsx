'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ChooseRolePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRole(role: string) {
    setLoading(true)
    setError('')

    const res = await fetch('/api/choose-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ClassFlow!</h1>
        <p className="text-gray-600 mb-8">Choose how you want to use this account.</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleRole('STUDENT')}
            disabled={loading}
            className="border-2 border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
          >
            <div className="font-semibold text-gray-900 text-lg">Student</div>
            <div className="text-sm text-gray-500 mt-1">Join classes and take quizzes</div>
          </button>
          <button
            onClick={() => handleRole('REP')}
            disabled={loading}
            className="border-2 border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
          >
            <div className="font-semibold text-gray-900 text-lg">Class Rep</div>
            <div className="text-sm text-gray-500 mt-1">Manage classes and assignments</div>
          </button>
        </div>
      </div>
    </div>
  )
}