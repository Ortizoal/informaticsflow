'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h1>
          <p className="text-gray-600">
            If an account with that email exists, we&apos;ve sent a password reset link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  )
}