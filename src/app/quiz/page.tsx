'use client'

import { useState } from 'react'
import TopicSelector from '@/components/quiz/TopicSelector'
import QuizRunner from '@/components/quiz/QuizRunner'
import QuizResults from '@/components/quiz/QuizResults'
import { QuizQuestion, QuizAttempt, QuizRemediation } from '@/types'
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
  const [remediation, setRemediation] = useState<QuizRemediation | null>(null)
  const [buildingRemediation, setBuildingRemediation] = useState(false)
  const [practiceRound, setPracticeRound] = useState(0)

  async function startQuiz(topic: string, diff: 'easy' | 'medium' | 'hard') {
    setLoading(true)
    setSelectedTopic(topic)
    setDifficulty(diff)
    setRemediation(null)
    setPracticeRound(0)
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
    const latestScore = Math.round((correct / finalAttempts.length) * 100)
    setScore(latestScore)

    setStage('results')

    // Submit score and prepare adaptive remediation in parallel.
    const submitPromise = fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attempts: finalAttempts,
        topic: selectedTopic,
        totalTime,
      }),
    })

    const hasWrongAnswers = finalAttempts.some((attempt) => !attempt.isCorrect)

    if (hasWrongAnswers) {
      setBuildingRemediation(true)
      try {
        const remediationRes = await fetch('/api/quiz/remediate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attempts: finalAttempts,
            topic: selectedTopic,
            difficulty,
            totalTime,
            score: latestScore,
          }),
        })
        const remediationData = await remediationRes.json()
        if (remediationData.success) {
          setRemediation({
            weakTopics: remediationData.weakTopics ?? [],
            practiceQuestions: remediationData.practiceQuestions ?? [],
            studyGuide: remediationData.studyGuide ?? null,
            studyPlan: remediationData.studyPlan ?? [],
          })
        } else {
          setRemediation(null)
        }
      } catch {
        setRemediation(null)
      } finally {
        setBuildingRemediation(false)
      }
    } else {
      setRemediation(null)
      setBuildingRemediation(false)
    }

    await submitPromise
  }

  function startAdaptivePractice() {
    if (!remediation?.practiceQuestions?.length) return

    setQuestions(remediation.practiceQuestions)
    if (remediation.weakTopics.length > 0) {
      setSelectedTopic(`Adaptive Practice: ${remediation.weakTopics.join(', ')}`)
    }
    setPracticeRound((value) => value + 1)
    setStage('running')
  }

  function restart() {
    setStage('select')
    setQuestions([])
    setAttempts([])
    setScore(0)
    setRemediation(null)
    setBuildingRemediation(false)
    setPracticeRound(0)
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
          remediation={remediation}
          buildingRemediation={buildingRemediation}
          onStartPractice={startAdaptivePractice}
          practiceRound={practiceRound}
          onRestart={restart}
        />
      )}
    </div>
  )
}