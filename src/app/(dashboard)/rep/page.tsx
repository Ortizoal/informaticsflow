import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function RepDashboardPage() {
  const session = await auth()
  const classes = await prisma.class.findMany({
    where: { repId: session?.user?.id },
    include: { _count: { select: { enrollments: true, assignments: true, files: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Classes</h1>
        <Link
          href="/rep/classes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Create Class
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No classes yet</p>
          <p className="text-sm">Create your first class to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/rep/classes/${cls.id}`}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-2">{cls.name}</h2>
              {cls.description && (
                <p className="text-sm text-gray-500 mb-4">{cls.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{cls._count.enrollments} students</span>
                <span>{cls._count.assignments} assignments</span>
                <span>{cls._count.files} files</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

