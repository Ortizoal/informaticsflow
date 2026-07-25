import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filename = searchParams.get('filename')
  if (!filename) {
    return NextResponse.json({ error: 'filename required' }, { status: 400 })
  }

  const blob = await put(filename, undefined, { access: 'public' })
  return NextResponse.json(blob)
}
