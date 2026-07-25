import { NextRequest, NextResponse } from 'next/server'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pathname } = await req.json()
  if (!pathname) {
    return NextResponse.json({ error: 'pathname required' }, { status: 400 })
  }

  const clientToken = await generateClientTokenFromReadWriteToken({
    pathname,
    allowedContentTypes: [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    maximumSizeInBytes: 50 * 1024 * 1024,
  })

  return NextResponse.json({ clientToken })
}
