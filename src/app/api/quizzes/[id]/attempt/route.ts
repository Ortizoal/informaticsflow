import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { quizId, score, maxScore, answers } = await req.json()

    if (typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json({ error: 'Invalid score data' }, { status: 400 })
    }

    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score,
        maxScore,
        answers: answers || null,
      },
    })

    return NextResponse.json({ id: attempt.id })
  } catch (error) {
    console.error('Save attempt error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}