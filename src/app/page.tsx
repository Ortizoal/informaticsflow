import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'unassigned') {
    redirect('/choose-role')
  }

  if (session.user.role === 'REP') {
    redirect('/rep')
  }

  redirect('/student')
}