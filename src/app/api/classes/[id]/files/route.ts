import { NextResponse } from 'next/server'
import crypto from 'crypto'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { put } from '@vercel/blob'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== 'REP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'pptx', 'ppt'].includes(ext || '')) {
      return NextResponse.json({ error: 'Only PDF and PPT files allowed' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const blob = await put(`classflow/${crypto.randomUUID()}`, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
    })

    const fileRecord = db.file.create({
      data: {
        name: file.name,
        type: ext || 'unknown',
        url: blob.url,
        size: file.size,
        classId: id,
      },
    })

    return NextResponse.json(fileRecord)
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
