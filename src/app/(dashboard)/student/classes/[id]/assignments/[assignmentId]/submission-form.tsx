'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmissionForm({
  assignmentId,
  classId,
  existingContent,
  grade,
}: {
  assignmentId: string
  classId: string
  existingContent: string | null
  grade: number | null
}) {
  const router = useRouter()
  const [content, setContent] = useState(existingContent || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setContent(existingContent || '')
  }, [existingContent])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    let submissionId: string | null = null

    if (existingContent !== null) {
      const getRes = await fetch(`/api/classes/${classId}/assignments/${assignmentId}/submissions`)
      if (getRes.ok) {
        const subs = await getRes.json()
        submissionId = subs?.[0]?.id || null
      }
    }

    const method = submissionId ? 'PATCH' : 'POST'
    const body: any = { content }
    if (submissionId) body.submissionId = submissionId

    const res = await fetch(`/api/classes/${classId}/assignments/${assignmentId}/submissions`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to submit')
    }
    setSubmitting(false)
  }

  if (grade !== null) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Submitted</span>
          <span className="text-lg font-bold text-green-600">{grade}/100</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{existingContent}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your submission here..."
          className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]"
          required
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : existingContent !== null ? 'Update Submission' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
