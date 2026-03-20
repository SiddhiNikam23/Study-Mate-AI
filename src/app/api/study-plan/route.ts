import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { reflectOnMemories, recallMemories } from '@/lib/hindsight'
import { getQuizHistory } from '@/lib/redis'
import { DEMO_USER_ID } from '@/lib/constants'

function extractTopicFromMistakeText(line: string): string | null {
  const topicMatch = line.match(/Topic:\s*([^\n.]+)/i)
  if (topicMatch?.[1]) return topicMatch[1].trim()

  const codeTopicMatch = line.match(/in topic\s+"([^"]+)"/i)
  if (codeTopicMatch?.[1]) return codeTopicMatch[1].trim()

  return null
}

function topTopicsFromList(items: string[], limit = 5): string[] {
  const map = new Map<string, number>()
  items.forEach((topic) => {
    map.set(topic, (map.get(topic) ?? 0) + 1)
  })
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic]) => topic)
}

export async function POST(req: NextRequest) {
  try {
    const { examDate, dailyHours = 2 } = await req.json()
    const userId = DEMO_USER_ID

    const weakAreasReflection = await reflectOnMemories(
      userId,
      'What are the top 5 weakest topics this student needs to focus on? List them briefly.'
    )

    const [quizHistory, quizMistakes, codeMistakes] = await Promise.all([
      getQuizHistory(userId),
      recallMemories(userId, 'MISTAKE wrong answer Topic', 30),
      recallMemories(userId, 'CODE MISTAKE failed in topic', 30),
    ])

    const topicScores: Record<string, number[]> = {}
    quizHistory.forEach((entry: { topic: string; score: number }) => {
      if (!entry?.topic) return
      if (!topicScores[entry.topic]) topicScores[entry.topic] = []
      topicScores[entry.topic].push(entry.score)
    })

    const weakQuizTopics = Object.entries(topicScores)
      .map(([topic, scores]) => ({
        topic,
        avg: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      }))
      .filter((entry) => entry.avg < 70)
      .sort((a, b) => a.avg - b.avg)
      .map((entry) => entry.topic)

    const wrongQuizTopics = topTopicsFromList(
      quizMistakes
        .map((m) => m.content ?? m.text ?? '')
        .map((line) => extractTopicFromMistakeText(line))
        .filter((v): v is string => Boolean(v)),
      5
    )

    const wrongCodeTopics = topTopicsFromList(
      codeMistakes
        .map((m) => m.content ?? m.text ?? '')
        .map((line) => extractTopicFromMistakeText(line))
        .filter((v): v is string => Boolean(v)),
      5
    )

    const combinedWeakTopics = topTopicsFromList([
      ...weakQuizTopics,
      ...wrongQuizTopics,
      ...wrongCodeTopics,
    ], 7)

    const systemPrompt = `You are a personalized study planner AI. Generate realistic, structured study plans based on student weaknesses. Return valid JSON only.`

    const userPrompt = `Create a 7-day study plan with strong focus on weak sections.

Primary weak topics (from quiz wrong answers + code arena failures):
${combinedWeakTopics.length ? combinedWeakTopics.join(', ') : 'General CS topics'}

Weak topics from quiz score trends (<70% avg):
${weakQuizTopics.length ? weakQuizTopics.join(', ') : 'No sufficient quiz trend data yet'}

Topics with wrong quiz questions:
${wrongQuizTopics.length ? wrongQuizTopics.join(', ') : 'No quiz mistake topics found'}

Topics with code arena wrong attempts:
${wrongCodeTopics.length ? wrongCodeTopics.join(', ') : 'No coding mistake topics found'}

Memory reflection:
${weakAreasReflection || 'No extra reflection available'}

Exam date: ${examDate || '7 days from now'}
Daily available hours: ${dailyHours}

Rules:
- Prioritize weak quiz and weak coding topics in first 3 days.
- Include both quiz sessions and coding sessions for weak topics.
- Each session reason must clearly mention why that weak topic is chosen.
- Include at least one revision block every day for previous mistakes.

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