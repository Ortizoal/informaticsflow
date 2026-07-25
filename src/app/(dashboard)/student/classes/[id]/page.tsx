import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function StudentClassDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id
  if (!id) return notFound()
  const session = await auth()

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      assignments: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { createdAt: 'desc' } },
      quizzes: { orderBy: { createdAt: 'desc' } },
      enrollments: { where: { userId: session?.user?.id } },
      _count: { select: { assignments: true, files: true, quizzes: true } },
    },
  })

  if (!cls || cls.enrollments.length === 0) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{cls.name}</h1>
        {cls.description && <p className="text-gray-500 mt-1">{cls.description}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-3">Assignments</h2>
          {cls.assignments.length === 0 ? (
            <p className="text-gray-400 text-sm">No assignments yet</p>
          ) : (
            <div className="space-y-2">
              {cls.assignments.map((a) => (
                <div key={a.id} className="bg-white rounded-lg shadow-sm border p-3">
                  <div className="font-medium text-sm">{a.title}</div>
                  {a.dueDate && (
                    <div className="text-xs text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Available Quizzes</h2>
          {cls.quizzes.length === 0 ? (
            <p className="text-gray-400 text-sm">No quizzes available</p>
          ) : (
            <div className="space-y-2">
              {cls.quizzes.map((q) => (
                <Link
                  key={q.id}
                  href={`/student/classes/${id}/quizzes/${q.id}`}
                  className="block bg-white rounded-lg shadow-sm border p-3 hover:shadow-md transition"
                >
                  <div className="font-medium text-sm">{q.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Course Files</h2>
        {cls.files.length === 0 ? (
          <p className="text-gray-400 text-sm">No files uploaded</p>
        ) : (
          <div className="space-y-2">
            {cls.files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-lg shadow-sm border p-3 flex items-center justify-between"
              >
                <span className="text-sm">{file.name}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href={`/student/exam-prep?classId=${id}`}
          className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
        >
          Exam Prep (AI Generated)
        </Link>
      </div>
    </div>
  )
}
