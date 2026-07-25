import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuizTaker from '@/components/quizzes/quiz-taker'

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>
}) {
  const { id, quizId } = await params
  const session = await auth()

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  })

  if (!quiz || quiz.classId !== id) {
    notFound()
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: session?.user?.id || '', classId: id } },
  })

  if (!enrollment) {
    notFound()
  }

  const pastAttempts = await prisma.quizAttempt.findMany({
    where: { quizId, userId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}

      {pastAttempts.length > 0 && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold mb-2">Your Past Attempts</h2>
          <div className="space-y-1">
            {pastAttempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                <span className="font-medium">
                  {a.score} / {a.maxScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <QuizTaker quiz={quiz as any} />
    </div>
  )
}
