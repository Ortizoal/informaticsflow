import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { joinCode } = await req.json()

    const cls = await db.class.findUnique({ where: { id } })
    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (cls.joinCode !== joinCode) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 400 })
    }

    const existing = await db.enrollment.findMany({
      where: { userId: session.user.id, classId: id },
    })
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    const enrollment = await db.enrollment.create({
      data: { userId: session.user.id, classId: id },
    })

    return NextResponse.json(enrollment)
  } catch (err) {
    return NextResponse.json({ error: 'Server error: ' + (err instanceof Error ? err.message : 'unknown') }, { status: 500 })
  }
}
