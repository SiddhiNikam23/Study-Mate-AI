import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { recallMemories } from '@/lib/hindsight'
import { DEMO_USER_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty = 'medium' } = await req.json()
    const userId = DEMO_USER_ID

    const memories = await recallMemories(
      userId,
      `coding mistakes and errors in ${topic}`,
      5
    )
    const mistakeContext = memories.map((m) => m.content).join('\n')

    const systemPrompt = `You are a coding challenge generator like HackerRank. Generate targeted problems based on the student's past mistakes. Return valid JSON only — no markdown.`

    const userPrompt = `Generate a ${difficulty} coding challenge on: "${topic}"

Student's past coding mistakes:
${mistakeContext || 'No past coding mistakes — generate a standard problem.'}

Return ONLY this JSON:
{
  "id": "c1",
  "title": "Problem title",
  "description": "Full problem description with examples",
  "starterCode": "def solution():\\n    # Your code here\\n    pass",
  "testCases": [
    { "input": "example input", "expected": "expected output" }
  ],
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "hints": ["Hint 1 based on common mistakes", "Hint 2", "Hint 3"]
}`

    const raw = await generateWithGroq(systemPrompt, userPrompt, 2000)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ success: true, challenge: parsed })
  } catch (err) {
    console.error('Code challenge error:', err)
    return NextResponse.json({ success: false, error: 'Failed to generate challenge' }, { status: 500 })
  }
}