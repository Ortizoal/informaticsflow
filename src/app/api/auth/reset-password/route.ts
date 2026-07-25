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
    const { token, password } = await req.json()
    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const resetToken = await db.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashed = hashPassword(password)
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashed },
    })

    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}