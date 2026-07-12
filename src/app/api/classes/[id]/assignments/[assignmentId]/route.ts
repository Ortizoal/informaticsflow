import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const { id, assignmentId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assignment = db.assignment.findUnique({ where: { id: assignmentId } })

  if (!assignment || assignment.classId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const groups = db.group.findMany({
    where: { assignmentId: assignmentId },
    include: { members: true },
  })

  return NextResponse.json({ ...assignment, groups })
}
