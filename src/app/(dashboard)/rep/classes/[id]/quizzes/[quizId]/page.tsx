import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuizTaker from '@/components/quizzes/quiz-taker'

export default async function QuizDetailPage({
  params,
}: {
  params: { id: string; quizId: string }
}) {
  const session = await auth()

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      questions: true,
      class: { select: { name: true, repId: true } },
    },
  })

  if (!quiz || quiz.classId !== params.id) {
    notFound()
  }

  const isRep = quiz.class.repId === session?.user?.id

  if (isRep) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}
      <QuizTaker quiz={quiz} />
    </div>
  )
}
