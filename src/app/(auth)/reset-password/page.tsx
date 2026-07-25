'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    if (t) setToken(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    setLoading(false)

    if (res.ok) {
      setDone(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Password reset</h1>
          <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in with new password
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h1>
        <p className="text-gray-600 mb-6 text-sm">Enter your new password.</p>

        {!token && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 text-sm">
            Missing reset token. Check your reset link.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="At least 6 characters"
                minLength={6}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset password'}
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