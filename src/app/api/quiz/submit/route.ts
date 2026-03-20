import { NextRequest, NextResponse } from 'next/server'
import { logMistake, logStudySession } from '@/lib/hindsight'
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

    // Log each mistake to Hindsight memory
    const mistakePromises = attempts
      .filter((a) => !a.isCorrect)
      .map((a) =>
        logMistake(
          userId,
          a.topic,
          a.question,
          a.options?.[a.userAnswer] ?? String(a.userAnswer),
          a.options?.[a.correctAnswer] ?? String(a.correctAnswer)
        )
      )

    // Log the full session to Hindsight
    await Promise.all([
      ...mistakePromises,
      logStudySession(userId, topic, score, totalTime),
      saveQuizResult(userId, topic, score, attempts.length),
      updateStreak(userId),
    ])

    return NextResponse.json({
      success: true,
      score,
      correct,
      total: attempts.length,
      message: score >= 80
        ? 'Great job! Keep it up.'
        : score >= 50
        ? 'Good effort. Review the mistakes and try again.'
        : 'Needs improvement. StudyMate has updated your study plan.',
    })
  } catch (err) {
    console.error('Quiz submit error:', err)
    return NextResponse.json({ success: false, error: 'Submit failed' }, { status: 500 })
  }
}