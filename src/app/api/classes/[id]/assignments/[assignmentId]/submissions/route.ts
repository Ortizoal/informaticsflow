import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { classId: true, class: { select: { repId: true } } },
  })
  if (!assignment || assignment.classId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isRep = assignment.class.repId === session.user.id

  const submissions = await db.submission.findMany({
    where: { assignmentId, ...(isRep ? {} : { userId: session.user.id }) },
    include: isRep ? { user: { select: { id: true, name: true, email: true } } } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(submissions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { classId: true },
  })
  if (!assignment || assignment.classId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_classId: { userId: session.user.id, classId: id } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  const existing = await db.submission.findUnique({
    where: { assignmentId_userId: { assignmentId, userId: session.user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already submitted. Use PATCH to update.' }, { status: 409 })
  }

  const { content, fileUrl } = await req.json()

  const submission = await db.submission.create({
    data: {
      assignmentId,
      userId: session.user.id,
      content: content || null,
      fileUrl: fileUrl || null,
    },
  })

  return NextResponse.json(submission)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const submission = await db.submission.findUnique({
    where: { id: body.submissionId },
  })
  if (!submission || submission.assignmentId !== assignmentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { classId: true, class: { select: { repId: true } } },
  })

  const isRep = assignment?.class.repId === session.user.id
  const isOwner = submission.userId === session.user.id

  if (body.grade !== undefined && !isRep) {
    return NextResponse.json({ error: 'Only reps can grade' }, { status: 403 })
  }

  if (body.content !== undefined && !isOwner) {
    return NextResponse.json({ error: 'You can only edit your own submission' }, { status: 403 })
  }

  const updated = await db.submission.update({
    where: { id: body.submissionId },
    data: {
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.grade !== undefined ? { grade: body.grade } : {}),
    },
  })

  return NextResponse.json(updated)
}
