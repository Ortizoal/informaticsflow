import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'REP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, description } = await req.json()
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const cls = await prisma.class.create({
      data: {
        name,
        description,
        repId: session.user.id,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    })

    return NextResponse.json(cls)
  } catch (error) {
    console.error('Create class error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const joinCode = url.searchParams.get('joinCode')

  if (joinCode) {
    const cls = await prisma.class.findFirst({
      where: { joinCode: joinCode.toUpperCase() },
      include: { _count: { select: { enrollments: true, assignments: true } } },
    })
    return NextResponse.json(cls ? [cls] : [])
  }

  const classes = await prisma.class.findMany({
    where: session.user.role === 'REP'
      ? { repId: session.user.id }
      : { enrollments: { some: { userId: session.user.id } } },
    include: { _count: { select: { enrollments: true, assignments: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(classes)
}
