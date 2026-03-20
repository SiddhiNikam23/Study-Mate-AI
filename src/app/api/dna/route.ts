import { NextRequest, NextResponse } from 'next/server'
import { getUserDNASummary, recallMemories } from '@/lib/hindsight'
import { getStreak, getQuizHistory } from '@/lib/redis'
import { DEMO_USER_ID } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID

    const [dnaSummary, recentMistakes, streak, quizHistory] = await Promise.all([
      getUserDNASummary(userId),
      recallMemories(userId, 'recent mistakes and errors', 10),
      getStreak(userId),
      getQuizHistory(userId),
    ])

    // Build topic score map from quiz history
    const topicScores: Record<string, number[]> = {}
    quizHistory.forEach((q: { topic: string; score: number }) => {
      if (!topicScores[q.topic]) topicScores[q.topic] = []
      topicScores[q.topic].push(q.score)
    })

    const topicAverages = Object.entries(topicScores).map(([topic, scores]) => ({
      topic,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))

    return NextResponse.json({
      success: true,
      dnaSummary,
      recentMistakes: recentMistakes.map((m) => m.content),
      streak,
      topicAverages,
      quizHistory,
    })
  } catch (err) {
    console.error('DNA fetch error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch DNA' }, { status: 500 })
  }
}