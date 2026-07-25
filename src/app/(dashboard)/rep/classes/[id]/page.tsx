import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function RepClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      _count: { select: { enrollments: true } },
      assignments: { orderBy: { createdAt: 'desc' }, take: 10 },
      files: { orderBy: { createdAt: 'desc' }, take: 10 },
      quizzes: { orderBy: { createdAt: 'desc' }, take: 10 },
      enrollments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  })

  if (!cls || cls.repId !== session?.user?.id) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{cls.name}</h1>
        {cls.description && <p className="text-gray-500 mt-1">{cls.description}</p>}
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>Join Code: <strong className="text-blue-600">{cls.joinCode}</strong></span>
          <span>{cls._count.enrollments} students enrolled</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Link
          href={`/rep/classes/${id}/assignments/new`}
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition text-center"
        >
          <div className="text-2xl mb-1">+</div>
          <div className="font-medium">New Assignment</div>
        </Link>
        <Link
          href={`/rep/classes/${id}/files`}
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition text-center"
        >
          <div className="text-2xl mb-1">+</div>
          <div className="font-medium">Upload File</div>
        </Link>
        <Link
          href={`/rep/classes/${id}/quizzes/new`}
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition text-center"
        >
          <div className="text-2xl mb-1">+</div>
          <div className="font-medium">New Quiz</div>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Assignments</h2>
          {cls.assignments.length === 0 ? (
            <p className="text-gray-400 text-sm">No assignments yet</p>
          ) : (
            <div className="space-y-2">
              {cls.assignments.map((a) => (
                <Link
                  key={a.id}
                  href={`/rep/classes/${id}/assignments/${a.id}`}
                  className="block bg-white rounded-lg shadow-sm border p-3 hover:shadow-md transition"
                >
                  <div className="font-medium">{a.title}</div>
                  {a.dueDate && (
                    <div className="text-xs text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Enrolled Students</h2>
          {cls.enrollments.length === 0 ? (
            <p className="text-gray-400 text-sm">No students enrolled</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border divide-y">
              {cls.enrollments.map((e) => (
                <div key={e.id} className="p-3 text-sm flex justify-between">
                  <span>{e.user.name || 'Unnamed'}</span>
                  <span className="text-gray-400">{e.user.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
