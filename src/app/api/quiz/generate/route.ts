import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { recallMemories } from '@/lib/hindsight'
import { DEMO_USER_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty = 'medium', count = 5 } = await req.json()
    const userId = DEMO_USER_ID

    // Pull past mistakes from Hindsight memory
    const memories = await recallMemories(
      userId,
      `mistakes and weak areas in ${topic}`,
      5
    )
    const mistakeContext = memories.map((m) => m.content).join('\n')

    const systemPrompt = `You are an expert quiz generator for computer science students.
Generate targeted quiz questions based on the student's past mistakes.
Always respond with valid JSON only — no markdown, no explanation.`

    const userPrompt = `Generate ${count} MCQ questions on topic: "${topic}" at ${difficulty} difficulty.

Student's past mistakes in this area:
${mistakeContext || 'No past mistakes recorded yet — generate standard questions.'}

Return ONLY this JSON structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "explanation": "Brief explanation of why the answer is correct"
    }
  ]
}`

    const raw = await generateWithGroq(systemPrompt, userPrompt, 2000)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ success: true, ...parsed })
  } catch (err) {
    console.error('Quiz generate error:', err)
    return NextResponse.json({ success: false, error: 'Failed to generate quiz' }, { status: 500 })
  }
}