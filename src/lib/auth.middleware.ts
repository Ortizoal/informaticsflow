import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

const config: NextAuthConfig = {
  providers: [],
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
}

export const { auth: middleware } = NextAuth(config)
