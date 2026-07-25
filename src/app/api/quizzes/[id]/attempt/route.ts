import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { score, maxScore, answers } = await req.json()

    if (typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json({ error: 'Invalid score data' }, { status: 400 })
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score,
        maxScore,
        answers: answers || undefined,
      },
    })

    return NextResponse.json({ id: attempt.id })
  } catch (error) {
    console.error('Save attempt error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}