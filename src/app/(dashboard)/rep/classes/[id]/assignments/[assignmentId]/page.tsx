import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AssignmentDetailPage({
  params,
}: {
  params: { id: string; assignmentId: string }
}) {
  const session = await auth()

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
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

  if (!assignment || assignment.classId !== params.id) {
    notFound()
  }

  const isRep = assignment.class.repId === session?.user?.id

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/repo/classes/`}
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
              <Link
                href={`/api/classes/${params.id}/assignments/${params.assignmentId}/export`}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Export PDF
              </Link>
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
        <p className="text-sm text-gray-400 mt-6">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
