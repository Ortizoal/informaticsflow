'use client'

import { useEffect, useState } from 'react'

export default function ExamPrepPage() {
  const [classId, setClassId] = useState('')
  const [questions, setQuestions] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setClassId(params.get('classId') || '')
  }, [])

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
    setShowResults(true)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Exam Prep</h1>

      {!classId && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6 text-sm">
          No class selected. Go to a class page and click &quot;Exam Prep&quot; to start.
        </div>
      )}

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
            disabled={generating || !classId}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={generateQuestions}
            disabled={generating}
            className="mb-6 text-sm text-purple-600 hover:underline"
          >
            {generating ? 'Generating...' : 'Generate New Set'}
          </button>

          <div className="space-y-4 mb-6">
            {questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                <p className="font-medium text-sm mb-3">
                  {i + 1}. {q.text}
                </p>

                {q.type === 'mcq' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt: string, oi: number) => {
                      const isCorrect = showResults && opt === q.answer
                      const isWrong = showResults && answers[i] === opt && opt !== q.answer
                      return (
                        <label
                          key={oi}
                          className={`block p-3 rounded-lg border text-sm cursor-pointer transition ${
                            isCorrect
                              ? 'bg-green-50 border-green-400'
                              : isWrong
                              ? 'bg-red-50 border-red-400'
                              : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            value={opt}
                            checked={answers[i] === opt}
                            onChange={() => handleAnswer(i, opt)}
                            className="mr-2"
                          />
                          {opt}
                        </label>
                      )
                    })}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div>
                    <input
                      type="text"
                      value={answers[i] || ''}
                      onChange={(e) => handleAnswer(i, e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    {showResults && (
                      <p className="text-xs text-green-600 mt-1">
                        Correct answer: {q.answer}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showResults ? (
            <button
              onClick={checkAnswers}
              disabled={Object.keys(answers).length !== questions.length}
              className="w-full bg-purple-600 text-white rounded-lg py-3 font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              Check Answers
            </button>
          ) : (
            <div className="text-center bg-white rounded-xl shadow-sm border p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {questions.filter((q: any, i: number) => answers[i]?.toLowerCase().trim() === q.answer?.toLowerCase().trim()).length} / {questions.length}
              </div>
              <p className="text-gray-500">Questions answered correctly</p>
              <button
                onClick={() => setShowResults(false)}
                className="mt-4 text-sm text-purple-600 hover:underline"
              >
                Review Answers
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
