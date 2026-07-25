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
      submissions: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      class: { select: { name: true, repId: true } },
    },
  })

  if (!assignment || assignment.classId !== id) {
    notFound()
  }

  const isRep = assignment.class.repId === session?.user?.id

  return (
    <div>
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

      {assignment.submissions.length > 0 && isRep && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Submissions ({assignment.submissions.length})</h2>
          <div className="space-y-3">
            {assignment.submissions.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {s.user.name || s.user.email}
                    <span className="text-gray-400 ml-2 text-xs">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {s.grade !== null ? (
                    <span className="text-green-600 font-bold text-sm">{s.grade}/100</span>
                  ) : (
                    <span className="text-yellow-600 text-sm text-yellow-600 font-medium">Ungraded</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{s.content}</p>
                {s.grade === null && (
                  <GradeForm submissionId={s.id} classId={id} assignmentId={assignmentId} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {assignment.submissions.length === 0 && isRep && (
        <p className="text-gray-400 text-sm mb-8">No submissions yet.</p>
      )}

      {assignment.groups.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Groups</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignment.groups.map((group: any) => (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-sm mb-3 text-blue-600">{group.name}</h3>
                <ul className="space-y-1">
                  {group.members.map((member: any) => (
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
        <p className="text-sm text-gray-400 mt-6">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
