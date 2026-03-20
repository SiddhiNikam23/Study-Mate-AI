import { NextRequest, NextResponse } from 'next/server'
import { saveQuizResult, updateStreak } from '@/lib/redis'
import { QuizAttempt } from '@/types'
import { DEMO_USER_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { attempts, topic, totalTime }: {
      attempts: QuizAttempt[]
      topic: string
      totalTime: number
    } = await req.json()

    const userId = DEMO_USER_ID
    const correct = attempts.filter((a) => a.isCorrect).length
    const score = Math.round((correct / attempts.length) * 100)

    // Redis always works — save this first
    await Promise.all([
      saveQuizResult(userId, topic, score, attempts.length),
      updateStreak(userId),
    ])

    // Try Hindsight — but never crash if it fails
    try {
      const { logMistake, logStudySession } = await import('@/lib/hindsight')
      const wrongAttempts = attempts.filter((a) => !a.isCorrect)

      await Promise.allSettled([
        ...wrongAttempts.map((a) =>
          logMistake(
            userId,
            a.topic,
            a.question,
            a.options?.[a.userAnswer] ?? String(a.userAnswer),
            a.options?.[a.correctAnswer] ?? String(a.correctAnswer)
          )
        ),
        logStudySession(userId, topic, score, totalTime),
      ])
    } catch {
      console.warn('Hindsight logging skipped — score still saved to Redis')
    }

    return NextResponse.json({
      success: true,
      score,
      correct,
      total: attempts.length,
      message:
        score >= 80 ? 'Great job! Keep it up.' :
        score >= 50 ? 'Good effort. Review the mistakes.' :
        'Needs improvement. Your study plan has been updated.',
    })
  } catch (err) {
    console.error('Quiz submit error:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}