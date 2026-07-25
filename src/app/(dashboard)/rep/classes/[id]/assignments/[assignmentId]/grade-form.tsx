'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GradeForm({
  submissionId,
  classId,
  assignmentId,
}: {
  submissionId: string
  classId: string
  assignmentId: string
}) {
  const router = useRouter()
  const [grade, setGrade] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch(`/api/classes/${classId}/assignments/${assignmentId}/submissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, grade: Number(grade) }),
    })

    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="Grade (0-100)"
        className="w-28 border rounded-lg px-2 py-1 text-sm"
        required
      />
      <button
        type="submit"
        disabled={saving || !grade}
        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Grade'}
      </button>
    </form>
  )
}
