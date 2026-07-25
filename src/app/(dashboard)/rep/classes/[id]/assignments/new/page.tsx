'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [groupCount, setGroupCount] = useState(0)
  const [groupSize, setGroupSize] = useState(0)
  const [createGroups, setCreateGroups] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch(`/api/classes/${params.id}/assignments`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        dueDate: dueDate || null,
        groupCount: createGroups ? groupCount : null,
        groupSize: createGroups ? groupSize : null,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/rep/classes/${params.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create assignment')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Assignment</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-sm border p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="createGroups"
            checked={createGroups}
            onChange={(e) => setCreateGroups(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="createGroups" className="text-sm font-medium text-gray-700">
            Auto-assign groups
          </label>
        </div>

        {createGroups && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Groups
              </label>
              <input
                type="number"
                min={1}
                value={groupCount}
                onChange={(e) => setGroupCount(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Members per Group
              </label>
              <input
                type="number"
                min={1}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
        >
          Create Assignment
        </button>
      </form>
    </div>
  )
}
