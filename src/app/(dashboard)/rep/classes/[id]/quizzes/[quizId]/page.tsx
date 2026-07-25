import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuizTaker from '@/components/quizzes/quiz-taker'

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>
}) {
  const { id, quizId } = await params
  const session = await auth()

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      class: { select: { name: true, repId: true } },
    },
  })

  if (!quiz || quiz.classId !== id) {
    notFound()
  }

  const isRep = quiz.class.repId === session?.user?.id

  if (isRep) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { score: 'desc' },
    })

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}

        <h2 className="text-lg font-semibold mb-3">Attempts ({attempts.length})</h2>
        {attempts.length === 0 ? (
          <p className="text-gray-400 text-sm mb-6">No attempts yet.</p>
        ) : (
          <div className="space-y-2 mb-8">
            {attempts.map((a) => (
              <div key={a.id} className="bg-white rounded-lg shadow-sm border p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{a.user.name || a.user.email}</div>
                  <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-semibold">
                  {a.score} / {a.maxScore}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold mb-3">Questions ({quiz.questions.length})</h2>
        <div className="space-y-3">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium text-sm">Q{i + 1}:</span>{' '}
                  <span className="text-sm">{q.text}</span>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {q.type === 'mcq' ? 'MCQ' : 'Short Answer'}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">Answer: {q.answer}</p>
            </div>
          ))}
        </div>
      </div>
    )
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
