import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuizTaker from '@/components/quizzes/quiz-taker'

export default async function StudentQuizPage({
  params,
}: {
  params: { id: string; quizId: string }
}) {
  const session = await auth()

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      questions: true,
      class: {
        include: { enrollments: { where: { userId: session?.user?.id } } },
      },
    },
  })

  if (!quiz || quiz.classId !== params.id || quiz.class.enrollments.length === 0) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}
      <QuizTaker quiz={quiz} />
    </div>
  )
}
