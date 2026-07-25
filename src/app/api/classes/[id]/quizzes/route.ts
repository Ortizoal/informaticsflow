import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== 'REP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, sourceFileId, questions } = await req.json()
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        sourceFileId: sourceFileId || null,
        classId: id,
      },
    })

    if (questions && questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((q: { text: string; type: string; options?: string[]; answer: string }) => ({
          quizId: quiz.id,
          text: q.text,
          type: q.type,
          options: q.options || undefined,
          answer: q.answer,
        })),
      })
    }

    const savedQuestions = await prisma.question.findMany({ where: { quizId: quiz.id } })

    return NextResponse.json({ ...quiz, questions: savedQuestions })
  } catch (error) {
    console.error('Create quiz error:', error)
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }
}
