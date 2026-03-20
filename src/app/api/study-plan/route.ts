import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { reflectOnMemories } from '@/lib/hindsight'
import { DEMO_USER_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { examDate, dailyHours = 2 } = await req.json()
    const userId = DEMO_USER_ID

    const weakAreas = await reflectOnMemories(
      userId,
      'What are the top 5 weakest topics this student needs to focus on? List them briefly.'
    )

    const systemPrompt = `You are a personalized study planner AI. Generate realistic, structured study plans based on student weaknesses. Return valid JSON only.`

    const userPrompt = `Create a 7-day study plan for a student with these weak areas:
${weakAreas || 'General CS topics'}

Exam date: ${examDate || '7 days from now'}
Daily available hours: ${dailyHours}

Return ONLY this JSON:
{
  "plan": [
    {
      "day": 1,
      "date": "Day 1",
      "sessions": [
        {
          "topic": "Topic name",
          "duration": 60,
          "type": "quiz",
          "priority": "high",
          "reason": "Why this is prioritized"
        }
      ]
    }
  ],
  "summary": "One line summary of the plan"
}`

    const raw = await generateWithGroq(systemPrompt, userPrompt, 2000)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ success: true, ...parsed })
  } catch (err) {
    console.error('Study plan error:', err)
    return NextResponse.json({ success: false, error: 'Failed to generate plan' }, { status: 500 })
  }
}