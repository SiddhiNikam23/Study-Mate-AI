'use client'

import Link from 'next/link'
import { QuizAttempt } from '@/types'

interface Props {
  attempts: QuizAttempt[]
  score: number
  topic: string
  onRestart: () => void
}

export default function QuizResults({ attempts, score, topic, onRestart }: Props) {
  const correct = attempts.filter((a) => a.isCorrect).length
  const wrong = attempts.filter((a) => !a.isCorrect)

  const grade =
    score >= 90 ? { label: 'Excellent!', color: 'text-emerald-400', emoji: '🏆' } :
    score >= 70 ? { label: 'Good job!',  color: 'text-cyan-400',    emoji: '🎯' } :
    score >= 50 ? { label: 'Keep going', color: 'text-yellow-400',  emoji: '📈' } :
                  { label: 'Needs work', color: 'text-red-400',     emoji: '💪' }

  return (
    <div>
      {/* Score card */}
      <div className="card text-center mb-6">
        <div className="text-5xl mb-3">{grade.emoji}</div>
        <div className={`text-5xl font-bold mb-1 ${grade.color}`}>{score}%</div>
        <div className={`text-lg font-medium mb-2 ${grade.color}`}>{grade.label}</div>
        <div className="text-slate-400 text-sm">
          {correct} / {attempts.length} correct on <span className="text-slate-200">{topic}</span>
        </div>

        <div className="flex gap-3 justify-center mt-4">
          <div className="bg-emerald-900/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-emerald-400">{correct}</div>
            <div className="text-xs text-slate-400">Correct</div>
          </div>
          <div className="bg-red-900/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-red-400">{attempts.length - correct}</div>
            <div className="text-xs text-slate-400">Wrong</div>
          </div>
          <div className="bg-violet-900/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-violet-400">
              {Math.round(attempts.reduce((s, a) => s + a.timeSpent, 0) / attempts.length)}s
            </div>
            <div className="text-xs text-slate-400">Avg time</div>
          </div>
        </div>
      </div>

      {/* Hindsight memory note */}
      <div className="bg-violet-900/10 border border-violet-700/30 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-violet-400">🧠</span>
        <div>
          <p className="text-sm text-violet-300 font-medium">Memory updated</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {wrong.length > 0
              ? `${wrong.length} mistake${wrong.length > 1 ? 's' : ''} stored in Hindsight. Future quizzes will target these gaps.`
              : 'Perfect score! Hindsight has noted your mastery of this topic.'}
          </p>
        </div>
      </div>

      {/* Wrong answers review */}
      {wrong.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-200 mb-4">Review Mistakes</h2>
          <div className="space-y-4">
            {wrong.map((a, i) => (
              <div key={i} className="bg-[#1a1a2e] rounded-xl p-4 border border-red-900/30">
                <p className="text-sm text-slate-200 mb-3 leading-relaxed">{a.question}</p>
                <div className="space-y-1.5">
                  {a.options?.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-xs px-3 py-1.5 rounded-lg ${
                        oi === a.correctAnswer
                          ? 'bg-emerald-900/40 text-emerald-300'
                          : oi === a.userAnswer
                          ? 'bg-red-900/40 text-red-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {oi === a.correctAnswer && '✓ '}
                      {oi === a.userAnswer && oi !== a.correctAnswer && '✗ '}
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onRestart} className="btn-primary flex-1 py-3">
          Quiz Again
        </button>
        <Link href="/dashboard" className="btn-secondary flex-1 py-3 text-center">
          Dashboard
        </Link>
        <Link href="/dna" className="btn-secondary flex-1 py-3 text-center">
          See DNA Update →
        </Link>
      </div>
    </div>
  )
}