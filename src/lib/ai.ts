import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateQuestions(content: string, count: number = 5) {
  const model = genAI.getGenerativeModel({ model: `gemini-1.5-flash` })

  const prompt = `You are a quiz generator for educational content. Based on the following content, generate ${count} questions. Mix of multiple choice and short answer questions.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "text": "What is...",
      "type": "mcq",
      "options": ["option A", "option B", "option C", "option D"],
      "answer": "option A"
    },
    {
      "text": "Explain...",
      "type": "short_answer",
      "options": null,
      "answer": "The correct answer text"
    }
  ]
}

Content to generate from:
${content.substring(0, 50000)}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const cleaned = text.replace(/^`+(?:json)?\s*/, '').replace(/\s*`+$/, '')
  return JSON.parse(cleaned)
}

export async function generateExamQuestions(content: string, count: number = 10) {
  const model = genAI.getGenerativeModel({ model: `gemini-1.5-flash` })

  const prompt = `You are an exam preparation assistant. Based on the following course material, generate ${count} likely exam questions. Focus on key concepts, definitions, and important points that would most likely appear on an exam.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "text": "What is...",
      "type": "mcq",
      "options": ["option A", "option B", "option C", "option D"],
      "answer": "option A"
    },
    {
      "text": "Define...",
      "type": "short_answer",
      "options": null,
      "answer": "The correct answer text"
    }
  ]
}

Course material:
${content.substring(0, 50000)}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const cleaned = text.replace(/^`+(?:json)?\s*/, '').replace(/\s*`+$/, '')
  return JSON.parse(cleaned)
}