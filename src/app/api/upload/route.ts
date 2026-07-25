import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const blob = await put(file.name, buffer, { access: 'public' })
  return NextResponse.json({ url: blob.url, downloadUrl: blob.downloadUrl })
}
