import { NextRequest, NextResponse } from 'next/server'
import { handleUpload } from '@vercel/blob/client'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = await handleUpload({
    request: req,
    body,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
      maximumSizeInBytes: 50 * 1024 * 1024,
    }),
  } as any)
  return NextResponse.json(response)
}
