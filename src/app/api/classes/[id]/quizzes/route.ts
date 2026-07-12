import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== 'REP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, sourceFileId, questions } = await req.json()

    const quiz = db.quiz.create({
      data: {
        title,
        description,
        sourceFileId: sourceFileId || null,
        classId: id,
      },
    })

    if (questions && questions.length > 0) {
      db.question.createMany({
        data: questions.map((q: any) => ({
          quizId: quiz.id,
          text: q.text,
          type: q.type,
          options: q.options ? JSON.stringify(q.options) : null,
          answer: q.answer,
        })),
      })
    }

    const savedQuestions = db.question.findMany({ where: { quizId: quiz.id } })

    return NextResponse.json({ ...quiz, questions: savedQuestions })
  } catch (error) {
    console.error('Create quiz error:', error)
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }
}
