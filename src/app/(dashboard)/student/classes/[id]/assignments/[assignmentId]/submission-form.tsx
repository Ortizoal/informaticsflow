'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  classId: string
  assignmentId: string
  existing?: { id: string; content: string | null; fileUrl: string | null; grade: number | null } | null
}

export default function SubmissionForm({ classId, assignmentId, existing }: Props) {
  const [content, setContent] = useState(existing?.content || '')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState(existing?.fileUrl || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const alreadySubmitted = !!existing

  const handleFileUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const tokenRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: file.name }),
      })
      if (!tokenRes.ok) {
        const data = await tokenRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to get upload token')
      }
      const { clientToken } = await tokenRes.json()
      if (!clientToken) throw new Error('No upload token received')

      const { put } = await import('@vercel/blob/client')
      const result = await put(file.name, file, {
        access: 'public',
        token: clientToken,
      })
      setFileUrl(result.downloadUrl)
    } catch (err: any) {
      setError(err?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const method = alreadySubmitted ? 'PATCH' : 'POST'
    const body: any = { content, fileUrl: fileUrl || undefined }
    if (alreadySubmitted) {
      body.submissionId = existing!.id
    }

    const res = await fetch(
      `/api/classes/${classId}/assignments/${assignmentId}/submissions`,
      { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setSubmitting(false)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
      <h2 className="text-lg font-semibold">
        {alreadySubmitted ? 'Update Submission' : 'Submit Assignment'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Written response</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border rounded-lg p-3 text-sm"
          placeholder="Type your answer here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File attachment</label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          {file && !fileUrl && (
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={uploading}
              className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
        {fileUrl && (
          <p className="text-xs text-green-600 mt-1">
            File attached: <a href={fileUrl} target="_blank" className="underline">{fileUrl.split('/').pop()}</a>
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : alreadySubmitted ? 'Update' : 'Submit'}
        </button>
        {existing?.grade !== null && existing?.grade !== undefined && (
          <span className="text-sm font-medium">
            Grade: <span className={existing.grade >= 70 ? 'text-green-600' : 'text-red-600'}>{existing.grade}/100</span>
          </span>
        )}
      </div>
    </form>
  )
}
