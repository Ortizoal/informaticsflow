'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ExamPrepPage() {
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId') || ''
  const [questions, setQuestions] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  async function generateQuestions() {
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          type: 'exam',
          count: 10,
        }),
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
        setAnswers({})
        setShowResults(false)
      } else {
        setGenError(data.error || 'Generation failed')
      }
    } catch {
      setGenError('Failed to connect to generation service')
    }
    setGenerating(false)
  }

  function handleAnswer(questionIndex: number, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }))
  }

  function checkAnswers() {
    let correct = 0
    for (let i = 0; i < questions.length; i++) {
      if (answers[i]?.toLowerCase().trim() === questions[i].answer.toLowerCase().trim()) {
        correct++
      }
    }
    setScore(correct)
    setShowResults(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Exam Prep</h1>

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Generate practice questions based on your course materials.
          </p>
          {genError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm max-w-md mx-auto">{genError}</div>
          )}
          <button
            onClick={generateQuestions}
            disabled={generating}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {generating ? 'Generating Questions...' : 'Generate Practice Questions'}
          </button>
        </div>
      ) : (
        <div>
          {showResults && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {score} / {questions.length}
              </div>
              <p className="text-gray-500 text-sm">Practice Score</p>
              <button
                onClick={() => { setShowResults(false); setAnswers({}) }}
                className="mt-3 text-purple-600 text-sm hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                <p className="font-medium text-sm mb-3">
                  {i + 1}. {q.text}
                </p>

                {q.type === 'mcq' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt: string, oi: number) => (
                      <label
                        key={oi}
                        className="block p-3 rounded-lg border text-sm cursor-pointer transition"
                      >
                        <input
                          type="radio"
                          name={`q-${i}`}
                          value={opt}
                          onChange={() => handleAnswer(i, opt)}
                          disabled={showResults}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div>
                    <input
                      type="text"
                      value={answers[i] || ''}
                      onChange={(e) => handleAnswer(i, e.target.value)}
                      placeholder="Type your answer..."
                      disabled={showResults}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    {showResults && (
                      <p className="text-xs text-green-600 mt-1">Answer: {q.answer}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showResults && (
            <div className="flex gap-3">
              <button
                onClick={checkAnswers}
                disabled={Object.keys(answers).length !== questions.length}
                className="flex-1 bg-purple-600 text-white rounded-lg py-3 font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                Check Answers
              </button>
              <button
                onClick={generateQuestions}
                disabled={generating}
                className="px-6 bg-white border rounded-lg py-3 font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                New Questions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
