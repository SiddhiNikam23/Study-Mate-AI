'use client'

import { useState } from 'react'
import { CodeChallenge } from '@/types'

interface Props {
  challenge: CodeChallenge
  code: string
  attempts: number
  topic: string
}

export default function HintPanel({ challenge, code, attempts, topic }: Props) {
  const [hintLevel, setHintLevel] = useState(1)
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [revealedBuiltin, setRevealedBuiltin] = useState<number[]>([])

  async function getAIHint() {
    setLoading(true)
    try {
      const res = await fetch('/api/code/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: challenge.title,
          code,
          error: attempts > 0 ? 'Wrong output or logic error' : '',
          topic,
          hintLevel,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setHint(data.hint)
        setHintLevel((l) => Math.min(l + 1, 3))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Hint level indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">Hint level:</span>
        {[1, 2, 3].map((l) => (
          <div
            key={l}
            className={`w-2 h-2 rounded-full transition-colors ${
              l < hintLevel ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          />
        ))}
        <span className="text-xs text-slate-500 ml-1">
          {hintLevel === 1 ? 'Gentle nudge'
            : hintLevel === 2 ? 'Specific direction'
            : 'Near solution'}
        </span>
      </div>

      {/* AI Personalised hint */}
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-600">🧠</span>
          <span className="text-xs font-medium text-blue-700">Personalised AI Hint</span>
          <span className="text-xs text-slate-500 ml-auto">
            Based on your mistake history
          </span>
        </div>

        {hint ? (
          <p className="text-sm text-slate-700 leading-relaxed">{hint}</p>
        ) : (
          <p className="text-xs text-slate-500">
            Click below to get a hint personalised to your past mistakes.
            {attempts === 0 && ' Try running your code first for better hints.'}
          </p>
        )}

        <button
          onClick={getAIHint}
          disabled={loading || hintLevel > 3}
          className="mt-3 btn-secondary text-sm w-full disabled:opacity-40"
        >
          {loading
            ? 'Thinking...'
            : hintLevel > 3
            ? 'Max hints used'
            : hint
            ? 'Get stronger hint →'
            : 'Get personalised hint'}
        </button>
      </div>

      {/* Built-in hints */}
      {challenge.hints?.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">
            Built-in Hints
          </h3>
          <div className="space-y-2">
            {challenge.hints.map((h, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200">
                {revealedBuiltin.includes(i) ? (
                  <div className="p-3 text-sm text-slate-700">{h}</div>
                ) : (
                  <button
                    onClick={() => setRevealedBuiltin((r) => [...r, i])}
                    className="w-full p-3 text-left text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Hint {i + 1} — click to reveal
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Mistake logged</p>
        <p className="text-xs text-slate-600">
          Each hint request is stored in Hindsight memory. Future challenges will be
          adjusted based on where you get stuck.
        </p>
      </div>
    </div>
  )
}