import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function StudentDashboardPage() {
  const session = await auth()
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session?.user?.id },
    include: {
      class: {
        include: { _count: { select: { assignments: true, quizzes: true } } },
      },
    },
    orderBy: { class: { name: 'asc' } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Classes</h1>
        <Link
          href="/student/join"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          Join Class
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No classes joined yet</p>
          <p className="text-sm">Ask your class representative for the join code.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.class.id}
              href={`/student/classes/`}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-2">{enrollment.class.name}</h2>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{enrollment.class._count.assignments} assignments</span>
                <span>{enrollment.class._count.quizzes} quizzes</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
