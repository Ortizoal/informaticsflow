'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  classId: string
  assignmentId: string
  submissionId: string
  currentGrade: number | null
}

export default function GradeForm({ classId, assignmentId, submissionId, currentGrade }: Props) {
  const [grade, setGrade] = useState(currentGrade?.toString() || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(grade, 10)
    if (isNaN(val) || val < 0 || val > 100) return

    setSaving(true)
    const res = await fetch(
      `/api/classes/${classId}/assignments/${assignmentId}/submissions`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, grade: val }),
      }
    )

    if (res.ok) router.refresh()
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="w-16 border rounded px-2 py-1 text-sm text-center"
        placeholder="0"
      />
      <span className="text-xs text-gray-400">/ 100</span>
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : currentGrade !== null ? 'Update' : 'Grade'}
      </button>
    </form>
  )
}
