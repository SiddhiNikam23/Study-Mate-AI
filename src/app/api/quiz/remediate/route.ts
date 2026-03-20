import { NextRequest, NextResponse } from 'next/server'
import { QuizAttempt, QuizQuestion } from '@/types'
import { generateWithGroq } from '@/lib/groq'

interface StudyGuideFix {
  question: string
  yourAnswer: string
  correctAnswer: string
  explanation: string
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    let clean = raw.trim()
    clean = clean
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start === -1 || end === -1) return null

    return JSON.parse(clean.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }
}

function buildStudyGuide(wrongAttempts: QuizAttempt[]) {
  const weakTopicCounts = wrongAttempts.reduce<Record<string, number>>((acc, attempt) => {
    acc[attempt.topic] = (acc[attempt.topic] ?? 0) + 1
    return acc
  }, {})

  const weakTopics = Object.entries(weakTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)

  const focusPoints = wrongAttempts
    .slice(0, 5)
    .map((attempt) => attempt.question)

  const mistakeFixes: StudyGuideFix[] = wrongAttempts.slice(0, 6).map((attempt) => {
    const yourAnswer =
      attempt.userAnswer >= 0
        ? attempt.options?.[attempt.userAnswer] ?? String(attempt.userAnswer)
        : 'No answer selected'

    const correctAnswer =
      attempt.options?.[attempt.correctAnswer] ?? String(attempt.correctAnswer)

    return {
      question: attempt.question,
      yourAnswer,
      correctAnswer,
      explanation: attempt.explanation ?? 'Review the concept and compare your reasoning with the correct option.',
    }
  })

  const checklist = wrongAttempts
    .slice(0, 5)
    .map((attempt, index) => {
      const explanation = attempt.explanation
      return explanation
        ? `Fix ${index + 1}: ${explanation}`
        : `Fix ${index + 1}: Revisit concept behind "${attempt.question}" and solve 2 similar MCQs.`
    })

  return {
    weakTopics,
    focusPoints,
    mistakeFixes,
    checklist,
  }
}

function buildStudyPlan(weakTopics: string[]) {
  const topWeak = weakTopics.slice(0, 2)
  const primary = topWeak[0] ?? 'Core Concepts'
  const secondary = topWeak[1] ?? primary

  return [
    {
      day: 1,
      title: `Repair fundamentals in ${primary}`,
      recommendedMinutes: 90,
      tasks: [
        `Read short notes for ${primary} (20 min).`,
        `Solve 10 untimed practice MCQs on ${primary} (40 min).`,
        'Write an error log: each mistake, why it happened, and corrected reasoning (30 min).',
      ],
    },
    {
      day: 2,
      title: `Targeted speed practice on ${secondary}`,
      recommendedMinutes: 90,
      tasks: [
        `Revise key formulas/concepts for ${secondary} (15 min).`,
        `Take a timed quiz on ${secondary} and ${primary} (45 min).`,
        'Review only incorrect answers and create 5 flashcards (30 min).',
      ],
    },
    {
      day: 3,
      title: 'Mixed reinforcement and confidence check',
      recommendedMinutes: 90,
      tasks: [
        `Attempt mixed quiz from weak topics: ${topWeak.join(' + ') || primary} (45 min).`,
        'Teach-back session: explain 3 mistakes aloud without notes (15 min).',
        'Final recap and repeat hardest 5 questions until correct (30 min).',
      ],
    },
  ]
}

async function generatePracticeQuestions(
  weakTopics: string[],
  wrongAttempts: QuizAttempt[],
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuizQuestion[]> {
  const count = Math.min(10, Math.max(6, wrongAttempts.length * 2))

  const topicLine = weakTopics.length > 0 ? weakTopics.join(', ') : wrongAttempts[0]?.topic
  const mistakesContext = wrongAttempts
    .slice(0, 6)
    .map((attempt, index) => {
      const yourAnswer =
        attempt.userAnswer >= 0
          ? attempt.options?.[attempt.userAnswer] ?? String(attempt.userAnswer)
          : 'No answer selected'
      const correctAnswer = attempt.options?.[attempt.correctAnswer] ?? String(attempt.correctAnswer)
      return `${index + 1}. Q: ${attempt.question}\nUser answered: ${yourAnswer}\nCorrect answer: ${correctAnswer}`
    })
    .join('\n\n')

  const systemPrompt = `You are an expert adaptive quiz generator. Return strict JSON only.`
  const userPrompt = `Generate ${count} MCQ practice questions for weak topics: ${topicLine}.
Difficulty: ${difficulty}.
Focus on concepts where this student made mistakes:
${mistakesContext}

Return ONLY this JSON:
{
  "questions": [
    {
      "id": "practice_q1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "topic": "One weak topic",
      "difficulty": "${difficulty}",
      "explanation": "Short explanation"
    }
  ]
}`

  const raw = await generateWithGroq(systemPrompt, userPrompt, 2200)
  const parsed = parseJsonObject(raw)
  const questions = (parsed?.questions as QuizQuestion[] | undefined) ?? []

  if (!Array.isArray(questions) || questions.length === 0) {
    return []
  }

  return questions.map((q, index) => ({
    ...q,
    id: q.id || `practice_q${index + 1}`,
    topic: q.topic || weakTopics[0] || 'General',
    difficulty,
    options: Array.isArray(q.options) && q.options.length === 4
      ? q.options
      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
  }))
}

export async function POST(req: NextRequest) {
  try {
    const {
      attempts,
      difficulty = 'medium',
    }: {
      attempts: QuizAttempt[]
      difficulty?: 'easy' | 'medium' | 'hard'
    } = await req.json()

    if (!Array.isArray(attempts) || attempts.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid attempts payload' }, { status: 400 })
    }

    const wrongAttempts = attempts.filter((attempt) => !attempt.isCorrect)

    if (wrongAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        weakTopics: [],
        practiceQuestions: [],
        studyGuide: null,
        studyPlan: [],
      })
    }

    const studyGuide = buildStudyGuide(wrongAttempts)
    const studyPlan = buildStudyPlan(studyGuide.weakTopics)

    let practiceQuestions: QuizQuestion[] = []
    try {
      practiceQuestions = await generatePracticeQuestions(studyGuide.weakTopics, wrongAttempts, difficulty)
    } catch (err) {
      console.warn('Practice generation failed, continuing with guide and plan only:', String(err))
    }

    return NextResponse.json({
      success: true,
      weakTopics: studyGuide.weakTopics,
      practiceQuestions,
      studyGuide,
      studyPlan,
    })
  } catch (err) {
    console.error('Quiz remediation error:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}
