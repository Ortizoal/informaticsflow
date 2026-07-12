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
    include: { questions: true },
  })

  if (!quiz || quiz.classId !== params.id) {
    notFound()
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: session?.user?.id || '', classId: params.id } },
  })

  if (!enrollment) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}
      <QuizTaker quiz={quiz as any} />
    </div>
  )
}
