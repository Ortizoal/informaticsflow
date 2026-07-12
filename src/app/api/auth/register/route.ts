import { NextResponse } from 'next/server'
import { randomBytes, scryptSync } from 'crypto'
import { db } from '@/lib/db'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashed = hashPassword(password)

    const user = await db.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
        role: role || 'STUDENT',
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, role: user.role })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
