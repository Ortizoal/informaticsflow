import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GradeForm from './grade-form'

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>
}) {
  const { id, assignmentId } = await params
  const session = await auth()

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      groups: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { name: 'asc' },
      },
      class: { select: { name: true, repId: true } },
    },
  })

  if (!assignment || assignment.classId !== id) {
    notFound()
  }

  const isRep = assignment.class.repId === session?.user?.id

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link
          href={`/rep/classes/${id}`}
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          &larr; Back to class
        </Link>
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        {assignment.description && (
          <p className="text-gray-500 mt-1">{assignment.description}</p>
        )}
      </div>

      {assignment.groups.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Groups</h2>
            {isRep && (
              <button
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                disabled
                title="PDF export coming soon"
              >
                Export PDF
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignment.groups.map((group: any) => (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-sm mb-3 text-blue-600">{group.name}</h3>
                <ul className="space-y-1">
                  {group.members.map((member) => (
                    <li key={member.id} className="text-sm text-gray-600">
                      {member.user.name || 'Unnamed'}
                      <span className="text-gray-400 ml-1">({member.user.email})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400">No groups assigned for this assignment.</p>
      )}

      {assignment.dueDate && (
        <p className="text-sm text-gray-400">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </p>
      )}

      {submissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Submissions ({submissions.length})</h2>
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{sub.user.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-400">{sub.user.email}</p>
                  </div>
                  <GradeForm
                    classId={id}
                    assignmentId={assignmentId}
                    submissionId={sub.id}
                    currentGrade={sub.grade}
                  />
                </div>
                {sub.content && (
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{sub.content}</p>
                )}
                {sub.fileUrl && (
                  <a href={sub.fileUrl} target="_blank" className="text-xs text-blue-600 underline mt-1 inline-block">
                    View attachment
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Submitted {new Date(sub.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
