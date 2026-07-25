import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await db.passwordResetToken.create({
      data: { email, token, expiresAt },
    })

    console.log(`Password reset token for ${email}: ${token}`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}