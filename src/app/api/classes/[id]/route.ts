import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cls = await db.class.findUnique({ where: { id: id } })
  if (!cls) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  const isRep = cls.repId === session.user.id
  const enrollments = await db.enrollment.findMany({ where: { userId: session.user.id, classId: id } })
  const isEnrolled = enrollments.length > 0
  if (!isRep && !isEnrolled) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const [assignments, files, quizzes, allEnrollments, rep] = await Promise.all([
    db.assignment.findMany({ where: { classId: id } }),
    db.file.findMany({ where: { classId: id } }),
    db.quiz.findMany({ where: { classId: id } }),
    db.enrollment.findMany({ where: { classId: id }, include: { user: true } }),
    db.user.findUnique({ where: { id: cls.repId } }),
  ])

  return NextResponse.json({
    ...cls,
    assignments,
    files,
    quizzes,
    enrollments: allEnrollments,
    rep,
  })
}
