'use client'

import Link from 'next/link'
import { QuizAttempt, QuizRemediation } from '@/types'

interface Props {
  attempts: QuizAttempt[]
  score: number
  topic: string
  remediation: QuizRemediation | null
  buildingRemediation: boolean
  onStartPractice: () => void
  practiceRound: number
  onRestart: () => void
}

export default function QuizResults({
  attempts,
  score,
  topic,
  remediation,
  buildingRemediation,
  onStartPractice,
  practiceRound,
  onRestart,
}: Props) {
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

      {/* Adaptive remediation */}
      {wrong.length > 0 && (
        <div className="card mb-6 border border-violet-700/30">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-semibold text-slate-200">Adaptive Recovery Plan</h2>
            <span className="text-xs bg-violet-900/40 text-violet-300 px-2 py-1 rounded-full border border-violet-700/40">
              {practiceRound > 0 ? `Practice Round ${practiceRound}` : 'Round 1 Ready'}
            </span>
          </div>

          {buildingRemediation ? (
            <div className="bg-violet-900/15 border border-violet-800/30 rounded-xl p-4">
              <p className="text-sm text-violet-300 font-medium">Building your personalised practice...</p>
              <p className="text-xs text-slate-400 mt-1">
                Analysing wrong answers to generate weak-topic questions, a study guide, and a focused plan.
              </p>
            </div>
          ) : (
            <>
              {remediation?.weakTopics?.length ? (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Weak topics detected</p>
                  <div className="flex flex-wrap gap-2">
                    {remediation.weakTopics.map((weakTopic) => (
                      <span
                        key={weakTopic}
                        className="text-xs bg-red-900/30 text-red-300 border border-red-700/40 px-2 py-1 rounded-lg"
                      >
                        {weakTopic}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {remediation?.studyGuide && (
                <div className="bg-[#1a1a2e] border border-[#1e3a5f] rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-violet-300 mb-2">Study Guide for Your Wrong Topics</p>
                  {remediation.studyGuide.focusPoints.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-1">Focus on these questions/concepts</p>
                      <div className="space-y-1">
                        {remediation.studyGuide.focusPoints.map((point, index) => (
                          <p key={`${point}-${index}`} className="text-xs text-slate-300">
                            {index + 1}. {point}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {remediation.studyGuide.mistakeFixes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-1">Wrong answer fixes</p>
                      <div className="space-y-2">
                        {remediation.studyGuide.mistakeFixes.slice(0, 3).map((fix, index) => (
                          <div key={`${fix.question}-${index}`} className="bg-slate-900/40 rounded-lg p-2.5">
                            <p className="text-xs text-slate-300">{fix.question}</p>
                            <p className="text-xs text-red-300 mt-1">Your answer: {fix.yourAnswer}</p>
                            <p className="text-xs text-emerald-300">Correct: {fix.correctAnswer}</p>
                            <p className="text-xs text-slate-400 mt-1">{fix.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {remediation.studyGuide.checklist.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Quick revision checklist</p>
                      <div className="space-y-1">
                        {remediation.studyGuide.checklist.slice(0, 4).map((item, index) => (
                          <p key={`${item}-${index}`} className="text-xs text-slate-300">• {item}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {remediation?.studyPlan?.length ? (
                <div className="bg-cyan-900/10 border border-cyan-800/30 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-cyan-300 mb-2">Auto-Created Study Plan</p>
                  <div className="space-y-2.5">
                    {remediation.studyPlan.map((day) => (
                      <div key={day.day} className="bg-[#1a1a2e] rounded-lg p-3 border border-[#1e3a5f]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-medium text-slate-200">
                            Day {day.day}: {day.title}
                          </p>
                          <span className="text-[11px] text-cyan-300">{day.recommendedMinutes} min</span>
                        </div>
                        <div className="space-y-1">
                          {day.tasks.map((task, index) => (
                            <p key={`${task}-${index}`} className="text-xs text-slate-400">• {task}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onStartPractice}
                  disabled={!remediation?.practiceQuestions?.length}
                  className="btn-primary py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {remediation?.practiceQuestions?.length
                    ? `Practice Weak Topics (${remediation.practiceQuestions.length} Q) →`
                    : 'Practice questions unavailable'}
                </button>
                <Link href="/study-plan" className="btn-secondary py-2.5 px-4 text-center">
                  Open Full Study Plan
                </Link>
              </div>
            </>
          )}
        </div>
      )}

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