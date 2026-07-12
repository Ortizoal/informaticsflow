import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateQuestions, generateExamQuestions } from '@/lib/ai'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { content, type, count } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const result =
      type === 'exam'
        ? await generateExamQuestions(content, count || 10)
        : await generateQuestions(content, count || 5)

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}
