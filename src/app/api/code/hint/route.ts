import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { recallMemories, logCodeMistake } from '@/lib/hindsight'
import { DEMO_USER_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { problemTitle, code, error, topic, hintLevel = 1 } = await req.json()
    const userId = DEMO_USER_ID

    // Log this as a code mistake in Hindsight
    if (error) {
      await logCodeMistake(userId, problemTitle, error, code)
    }

    // Recall past mistakes for personalised hint
    const memories = await recallMemories(
      userId,
      `coding mistakes patterns errors ${topic}`,
      5
    )
    const pastMistakes = memories.map((m) => m.content).join('\n')

    const systemPrompt = `You are a personalized coding mentor. Generate hints that directly address the student's specific mistake patterns. Be encouraging but specific.`

    const userPrompt = `Student is stuck on: "${problemTitle}"

Their current code:
${code}

Error they got: ${error || 'Logic error / wrong output'}

Their past mistake patterns:
${pastMistakes || 'No history yet'}

Hint level: ${hintLevel}/3 (1=gentle nudge, 2=specific direction, 3=near-solution)

Give a personalized hint at level ${hintLevel}. Reference their past patterns if relevant. Keep it under 100 words.`

    const hint = await generateWithGroq(systemPrompt, userPrompt, 300)

    return NextResponse.json({ success: true, hint })
  } catch (err) {
    console.error('Hint error:', err)
    return NextResponse.json({ success: false, error: 'Failed to generate hint' }, { status: 500 })
  }
}