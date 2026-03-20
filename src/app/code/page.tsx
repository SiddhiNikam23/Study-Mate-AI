'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { CODE_TOPICS } from '@/lib/constants'
import { CodeChallenge } from '@/types'

const CodeEditor = dynamic(() => import('@/components/code/CodeEditor'), { ssr: false })

type Stage = 'select' | 'coding'

export default function CodeArenaPage() {
  const [stage, setStage] = useState<Stage>('select')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadChallenge(t: string, d: 'easy' | 'medium' | 'hard') {
    setLoading(true)
    setTopic(t)
    setDifficulty(d)
    try {
      const res = await fetch('/api/code/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t, difficulty: d }),
      })
      const data = await res.json()
      if (data.success && data.challenge) {
        setChallenge(data.challenge)
        setStage('coding')
      } else {
        alert('Failed to generate challenge. Check your Groq API key.')
      }
    } catch {
      alert('Network error.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStage('select')
    setChallenge(null)
  }

  return (
    <div className="min-h-screen">
      {stage === 'select' ? (
        <ChallengeSelector
          topics={CODE_TOPICS}
          onStart={loadChallenge}
          loading={loading}
        />
      ) : challenge ? (
        <CodeEditor
          challenge={challenge}
          topic={topic}
          difficulty={difficulty}
          onExit={reset}
        />
      ) : null}
    </div>
  )
}

function ChallengeSelector({
  topics, onStart, loading
}: {
  topics: string[]
  onStart: (t: string, d: 'easy' | 'medium' | 'hard') => void
  loading: boolean
}) {
  const [selected, setSelected] = useState('')
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard'>('medium')

  const DIFF = {
    easy:   { color: 'border-emerald-600 bg-emerald-900/20 text-emerald-400', desc: 'Warm up' },
    medium: { color: 'border-yellow-600 bg-yellow-900/20 text-yellow-400',   desc: 'Interview level' },
    hard:   { color: 'border-red-600 bg-red-900/20 text-red-400',             desc: 'Competitive' },
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 text-sm">← Dashboard</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Code Arena</h1>
          <p className="text-slate-400 text-sm">Personalised challenges · Mistake memory · Smart hints</p>
        </div>
      </div>

      {/* Difficulty */}
      <div className="card mb-5">
        <h2 className="font-medium text-slate-300 mb-3">Difficulty</h2>
        <div className="flex gap-3">
          {(Object.entries(DIFF) as [string, typeof DIFF.easy][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setDiff(key as 'easy' | 'medium' | 'hard')}
              className={`flex-1 border rounded-xl p-3 transition-all ${
                diff === key
                  ? cfg.color + ' border-2'
                  : 'border-[#1e3a5f] bg-[#1a1a2e] text-slate-400 hover:border-slate-500'
              }`}
            >
              <div className="font-medium text-sm capitalize">{key}</div>
              <div className="text-xs opacity-70 mt-0.5">{cfg.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="card mb-5">
        <h2 className="font-medium text-slate-300 mb-3">Topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={`p-3 rounded-xl text-sm text-left transition-all border ${
                selected === t
                  ? 'border-violet-500 bg-violet-900/30 text-violet-300'
                  : 'border-[#1e3a5f] bg-[#1a1a2e] text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Memory note */}
      <div className="bg-violet-900/10 border border-violet-800/30 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-violet-400 text-lg">🧠</span>
        <div>
          <p className="text-sm text-violet-300 font-medium">Challenges built from your mistake memory</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Hindsight checks your past coding errors — off-by-one, skipped edge cases, wrong complexity —
            and generates a problem that targets your exact weak patterns.
          </p>
        </div>
      </div>

      <button
        onClick={() => selected && onStart(selected, diff)}
        disabled={!selected || loading}
        className="btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Generating your challenge...'
          : selected
          ? `Start ${diff} challenge on ${selected} →`
          : 'Select a topic to begin'}
      </button>
    </div>
  )
}