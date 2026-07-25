'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  text: string
  type: 'mcq' | 'short_answer'
  options: string[]
  answer: string
}

export default function NewQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [generating, setGenerating] = useState(false)
  const [isManual, setIsManual] = useState(true)

  function addQuestion() {
    setQuestions([...questions, { text: '', type: 'short_answer', options: ['', '', '', ''], answer: '' }])
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  async function generateFromFile() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Sample educational content. Replace with actual extracted text from uploaded files.',
          type: 'quiz',
          count: 5,
        }),
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
        setIsManual(false)
      }
    } catch {}
    setGenerating(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch(`/api/classes/${params.id}/quizzes`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, questions }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/rep/classes/${params.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Quiz</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setIsManual(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
        >
          Manual
        </button>
        <button
          onClick={generateFromFile}
          disabled={generating}
          className="px-4 py-2 rounded-lg text-sm font-medium"
        >
          {generating ? 'Generating...' : 'Generate from Files'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {questions.map((q, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Question {i + 1}</span>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestion(i, { text: e.target.value })}
              placeholder="Question text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <select
              value={q.type}
              onChange={(e) => updateQuestion(i, { type: e.target.value as 'mcq' | 'short_answer' })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="short_answer">Short Answer</option>
              <option value="mcq">Multiple Choice</option>
            </select>
            {q.type === 'mcq' && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <input
                    key={oi}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const opts = [...q.options]
                      opts[oi] = e.target.value
                      updateQuestion(i, { options: opts })
                    }}
                    placeholder={`Option ${oi + 1}`}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                ))}
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Correct Answer</label>
              <input
                type="text"
                value={q.answer}
                onChange={(e) => updateQuestion(i, { answer: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
        >
          + Add Question
        </button>

        {questions.length > 0 && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
          >
            Save Quiz
          </button>
        )}
      </form>
    </div>
  )
}
