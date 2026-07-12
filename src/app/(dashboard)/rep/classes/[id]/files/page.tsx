'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FilesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<any[]>([])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'pptx', 'ppt'].includes(ext || '')) {
      setError('Only PDF and PPT files are allowed')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/classes/${params.id}/files`,  {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setFiles((prev) => [data, ...prev])
    } else {
      const data = await res.json()
      setError(data.error || 'Upload failed')
    }
    setUploading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Class Files</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Handout / PPT</label>
        <input
          type="file"
          accept=".pdf,.pptx,.ppt"
          onChange={handleUpload}
          disabled={uploading}
          className="w-full text-sm"
        />
        {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
      </div>

      {files.length === 0 ? (
        <p className="text-gray-400 text-sm">No files uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow-sm border p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-sm">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
