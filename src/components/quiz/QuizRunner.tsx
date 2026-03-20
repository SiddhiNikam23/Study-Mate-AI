'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { QuizQuestion, QuizAttempt } from '@/types'

interface Props {
  questions: QuizQuestion[]
  topic: string
  difficulty: string
  onComplete: (attempts: QuizAttempt[], totalTime: number) => void
}

export default function QuizRunner({ questions, topic, difficulty, onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const startTimeRef = useRef(0)
  const qStartTimeRef = useRef(0)

  const q = questions[current]
  const isLast = current === questions.length - 1

  // Auto-submit when timer runs out
  const handleConfirm = useCallback((forced = false) => {
    if (confirmed && !forced) return
    const timeSpent = Math.round((Date.now() - qStartTimeRef.current) / 1000)
    const answer = forced ? -1 : (selected ?? -1)
    const attempt: QuizAttempt = {
      questionId: q.id,
      question: q.question,
      topic: q.topic,
      options: q.options,
      explanation: q.explanation,
      userAnswer: answer,
      correctAnswer: q.correctAnswer,
      isCorrect: answer === q.correctAnswer,
      timeSpent,
      timestamp: Date.now(),
    }
    const newAttempts = [...attempts, attempt]
    setAttempts(newAttempts)
    setConfirmed(true)

    if (isLast) {
      setTimeout(() => {
        onComplete(newAttempts, Math.round((Date.now() - startTimeRef.current) / 1000))
      }, 1200)
    }
  }, [confirmed, selected, q, attempts, isLast, onComplete])

  useEffect(() => {
    startTimeRef.current = Date.now()
    qStartTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (confirmed) return
    if (timeLeft <= 0) { handleConfirm(true); return }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, confirmed, handleConfirm])

  function next() {
    if (!confirmed) return
    setTimeLeft(30)
    setSelected(null)
    setConfirmed(false)
    qStartTimeRef.current = Date.now()
    setCurrent((c) => c + 1)
  }

  const timerColor = timeLeft > 15 ? 'text-emerald-400' : timeLeft > 7 ? 'text-yellow-400' : 'text-red-400'
  const timerBg = timeLeft > 15 ? 'bg-emerald-400' : timeLeft > 7 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-sm text-slate-400">{topic}</span>
          <span className={`ml-2 badge-${difficulty}`}>{difficulty}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {current + 1} / {questions.length}
          </span>
          <div className={`text-2xl font-bold font-mono ${timerColor}`}>
            {String(timeLeft).padStart(2, '0')}s
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#1e3a5f] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${((current) / questions.length) * 100}%` }}
        />
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-[#1e3a5f] rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full ${timerBg} rounded-full transition-all duration-1000`}
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="card mb-6">
        <p className="text-lg text-slate-100 leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {q.options.map((opt, i) => {
          let style = 'border-[#1e3a5f] bg-[#1a1a2e] text-slate-300 hover:border-violet-500 hover:bg-violet-900/20'
          if (confirmed) {
            if (i === q.correctAnswer)
              style = 'border-emerald-500 bg-emerald-900/30 text-emerald-300'
            else if (i === selected && i !== q.correctAnswer)
              style = 'border-red-500 bg-red-900/30 text-red-300'
            else
              style = 'border-[#1e3a5f] bg-[#1a1a2e] text-slate-500 opacity-50'
          } else if (selected === i) {
            style = 'border-violet-500 bg-violet-900/30 text-violet-300'
          }

          return (
            <button
              key={i}
              onClick={() => !confirmed && setSelected(i)}
              disabled={confirmed}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${style}`}
            >
              <span className="text-xs font-mono mr-3 opacity-60">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {confirmed && i === q.correctAnswer && (
                <span className="ml-2 text-emerald-400">✓</span>
              )}
              {confirmed && i === selected && i !== q.correctAnswer && (
                <span className="ml-2 text-red-400">✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {confirmed && q.explanation && (
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-blue-400 mb-1">Explanation</p>
          <p className="text-sm text-slate-300">{q.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!confirmed ? (
          <button
            onClick={() => handleConfirm()}
            disabled={selected === null}
            className="btn-primary flex-1 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Answer
          </button>
        ) : !isLast ? (
          <button onClick={next} className="btn-primary flex-1 py-3">
            Next Question →
          </button>
        ) : (
          <div className="flex-1 text-center py-3 text-emerald-400 font-medium">
            Submitting results...
          </div>
        )}
      </div>
    </div>
  )
}