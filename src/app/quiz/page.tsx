'use client'

import { useState } from 'react'
import TopicSelector from '@/components/quiz/TopicSelector'
import QuizRunner from '@/components/quiz/QuizRunner'
import QuizResults from '@/components/quiz/QuizResults'
import { QuizQuestion, QuizAttempt } from '@/types'
import { TOPICS } from '@/lib/constants'

type Stage = 'select' | 'running' | 'results'

export default function QuizPage() {
  const [stage, setStage] = useState<Stage>('select')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)

  async function startQuiz(topic: string, diff: 'easy' | 'medium' | 'hard') {
    setLoading(true)
    setSelectedTopic(topic)
    setDifficulty(diff)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty: diff, count: 5 }),
      })
      const data = await res.json()
      if (data.success && data.questions?.length) {
        setQuestions(data.questions)
        setStage('running')
      } else {
        alert('Failed to generate quiz. Check your Groq API key.')
      }
    } catch {
      alert('Network error. Is the dev server running?')
    } finally {
      setLoading(false)
    }
  }

  async function submitQuiz(finalAttempts: QuizAttempt[], totalTime: number) {
    setAttempts(finalAttempts)
    const correct = finalAttempts.filter((a) => a.isCorrect).length
    setScore(Math.round((correct / finalAttempts.length) * 100))

    // Submit to API — logs to Hindsight in background
    await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attempts: finalAttempts,
        topic: selectedTopic,
        totalTime,
      }),
    })
    setStage('results')
  }

  function restart() {
    setStage('select')
    setQuestions([])
    setAttempts([])
    setScore(0)
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {stage === 'select' && (
        <TopicSelector
          topics={TOPICS}
          onStart={startQuiz}
          loading={loading}
        />
      )}
      {stage === 'running' && questions.length > 0 && (
        <QuizRunner
          questions={questions}
          topic={selectedTopic}
          difficulty={difficulty}
          onComplete={submitQuiz}
        />
      )}
      {stage === 'results' && (
        <QuizResults
          attempts={attempts}
          score={score}
          topic={selectedTopic}
          onRestart={restart}
        />
      )}
    </div>
  )
}