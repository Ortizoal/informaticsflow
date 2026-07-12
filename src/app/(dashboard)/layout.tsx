import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ClassFlow
          </Link>
          <nav className="flex items-center gap-4">
            {session.user.role === 'REP' && (
              <Link
                href="/rep/classes/new"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                New Class
              </Link>
            )}
            <span className="text-sm text-gray-500">{session.user.name || session.user.email}</span>
            <Link href="/api/auth/signout" className="text-sm text-gray-600 hover:text-gray-900">
              Sign Out
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
