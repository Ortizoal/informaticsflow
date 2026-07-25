import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SubmissionForm from './submission-form'

export default async function StudentAssignmentPage({
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
      class: { select: { name: true } },
    },
  })

  if (!assignment || assignment.classId !== id) {
    notFound()
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: session?.user?.id || '', classId: id } },
  })

  if (!enrollment) {
    notFound()
  }

  const myGroup = assignment.groups.find((g) =>
    g.members.some((m) => m.user.id === session?.user?.id)
  )

  const existing = await prisma.submission.findUnique({
    where: { assignmentId_userId: { assignmentId, userId: session?.user?.id || '' } },
    select: { id: true, content: true, fileUrl: true, grade: true },
  })

  return (
    <div className="space-y-6">
      <Link
        href={`/student/classes/${id}`}
        className="text-sm text-blue-600 hover:underline mb-2 inline-block"
      >
        &larr; Back to class
      </Link>
      <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
      {assignment.description && (
        <p className="text-gray-500 mb-4">{assignment.description}</p>
      )}
      {assignment.dueDate && (
        <p className="text-sm text-gray-400 mb-6">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </p>
      )}

      {myGroup ? (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-3">Your Group</h2>
          <p className="text-sm text-blue-600 font-medium mb-3">{myGroup.name}</p>
          <ul className="space-y-2">
            {myGroup.members.map((m) => (
              <li key={m.id} className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{m.user.name || 'Unnamed'}</span>
                {m.user.id === session?.user?.id && (
                  <span className="text-xs text-gray-400">(you)</span>
                )}
                <span className="text-gray-400 ml-1">{m.user.email}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-2">Your Group</h2>
          <p className="text-sm text-gray-400">
            {assignment.groups.length > 0
              ? "You haven't been assigned to a group for this assignment."
              : 'No groups have been created for this assignment yet.'}
          </p>
        </div>
      )}

      <SubmissionForm classId={id} assignmentId={assignmentId} existing={existing} />
    </div>
  )
}
