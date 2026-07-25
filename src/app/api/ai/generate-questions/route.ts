import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateQuestions, generateExamQuestions } from '@/lib/ai'
import { extractTextFromFile } from '@/lib/text-extraction'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { classId, type, count } = await req.json()

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 })
    }

    const files = await db.file.findMany({
      where: { classId },
      select: { name: true, url: true },
    })

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found in this class. Upload files first.' }, { status: 400 })
    }

    const textParts: string[] = []

    for (const file of files) {
      try {
        const res = await fetch(file.url)
        const buffer = Buffer.from(await res.arrayBuffer())
        const text = await extractTextFromFile(buffer, file.name)
        textParts.push(`--- ${file.name} ---\n${text}`)
      } catch (err) {
        console.error(`Failed to extract text from ${file.name}:`, err)
      }
    }

    if (textParts.length === 0) {
      return NextResponse.json({ error: 'Could not extract text from any files.' }, { status: 400 })
    }

    const content = textParts.join('\n\n')

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