import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { assignGroups } from '@/lib/group-utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== 'REP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, groupCount, groupSize, dueDate } = await req.json()

    const cls = db.class.findUnique({ where: { id: id } })
    if (!cls || cls.repId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const assignment = db.assignment.create({
      data: {
        title,
        description,
        groupCount: groupCount || null,
        groupSize: groupSize || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        classId: id,
      },
    })

    if (groupCount && groupSize) {
      const enrollments = db.enrollment.findMany({ where: { classId: id } })
      const studentIds = enrollments.map((e: any) => e.userId)
      const groups = assignGroups(studentIds, groupCount, groupSize)

      for (let i = 0; i < groups.length; i++) {
        const group = db.group.create({
          data: {
            name: `Group ${i + 1}`,
            assignmentId: assignment.id,
          },
        })

        db.groupMember.createMany({
          data: groups[i].map((userId) => ({ groupId: group.id, userId })),
        })
      }
    }

    const allGroups = db.group.findMany({
      where: { assignmentId: assignment.id },
      include: { members: true },
    })

    return NextResponse.json({ ...assignment, groups: allGroups })
  } catch (error) {
    console.error('Create assignment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
