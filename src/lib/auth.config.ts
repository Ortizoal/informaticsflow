import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from './db'
import { timingSafeEqual, scryptSync, randomBytes } from 'crypto'

function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':')
  if (!salt || !key) return false
  const derived = scryptSync(password, salt, 64).toString('hex')
  return timingSafeEqual(Buffer.from(key), Buffer.from(derived))
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email as string
        const password = credentials.password as string
        const user = db.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const isValid = verifyPassword(password, user.password)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role }
      return token
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; session.user.role = token.role as string }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
}
