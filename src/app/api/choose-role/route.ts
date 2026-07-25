import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { role } = await req.json()
    if (role !== 'STUDENT' && role !== 'REP') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await db.user.update({
      where: { email: session.user.email },
      data: { role },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Choose role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}