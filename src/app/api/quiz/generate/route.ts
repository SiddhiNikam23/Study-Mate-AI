import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { DEMO_USER_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty = 'medium', count = 5 } = await req.json()

    // Try to get memories — but don't crash if Hindsight fails
    let mistakeContext = ''
    try {
      const { recallMemories } = await import('@/lib/hindsight')
      const memories = await recallMemories(DEMO_USER_ID, `mistakes in ${topic}`, 5)
      mistakeContext = memories.map((m) => m.content ?? m.text ?? '').join('\n')
    } catch {
      console.warn('Hindsight recall skipped — generating standard questions')
    }

    const systemPrompt = `You are an expert quiz generator for computer science students.
Generate targeted quiz questions. Always respond with valid JSON only — no markdown, no backticks, no explanation.`

    const userPrompt = `Generate ${count} MCQ questions on topic: "${topic}" at ${difficulty} difficulty.

${mistakeContext ? `Student past mistakes:\n${mistakeContext}\n\nTarget questions at these weak areas.` : 'Generate standard questions covering key concepts.'}

Return ONLY this JSON — no other text:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "explanation": "Why this answer is correct"
    }
  ]
}`

    const raw = await generateWithGroq(systemPrompt, userPrompt, 2000)
    console.log('Groq raw (first 300):', raw.substring(0, 300))

    // Clean and parse
    let clean = raw.trim()
    // Remove markdown fences if present
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    // Find JSON object
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON found in response')
    clean = clean.substring(start, end + 1)

    const parsed = JSON.parse(clean)
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid questions format')
    }

    return NextResponse.json({ success: true, questions: parsed.questions })
  } catch (err) {
    console.error('Quiz generate error:', String(err))
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}