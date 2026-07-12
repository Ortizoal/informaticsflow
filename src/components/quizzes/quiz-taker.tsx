'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: string
  options: string | null
  answer: string
}

export default function QuizTaker({ quiz }: { quiz: { id: string; questions: Question[] } }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  function handleAnswer(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  function handleSubmit() {
    let correct = 0
    for (const q of quiz.questions) {
      if (answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        correct++
      }
    }
    setScore(correct)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {score} / {quiz.questions.length}
        </div>
        <p className="text-gray-500">
          {score === quiz.questions.length
            ? 'Perfect score!'
            : score >= quiz.questions.length / 2
            ? 'Good job!'
            : 'Keep practicing!'}
        </p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quiz.questions.map((q, i) => (
        <div key={q.id} className="bg-white rounded-xl shadow-sm border p-4">
          <p className="font-medium text-sm mb-3">
            {i + 1}. {q.text}
          </p>

          {q.type === 'mcq' && q.options && (
            <div className="space-y-2">
              {JSON.parse(q.options).map((opt: string, oi: number) => (
                <label
                  key={oi}
                  className="block p-3 rounded-lg border text-sm cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.type === 'short_answer' && (
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length !== quiz.questions.length}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        Submit Answers
      </button>
    </div>
  )
}
