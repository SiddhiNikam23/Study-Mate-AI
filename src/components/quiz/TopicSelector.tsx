'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  topics: string[]
  onStart: (topic: string, difficulty: 'easy' | 'medium' | 'hard') => void
  loading: boolean
}

const DIFF_CONFIG = {
  easy:   { label: 'Easy',   color: 'border-emerald-600 bg-emerald-900/20 text-emerald-400', desc: '5 min · Fundamentals' },
  medium: { label: 'Medium', color: 'border-yellow-600 bg-yellow-900/20 text-yellow-400',   desc: '10 min · Applied' },
  hard:   { label: 'Hard',   color: 'border-red-600 bg-red-900/20 text-red-400',             desc: '15 min · Advanced' },
}

export default function TopicSelector({ topics, onStart, loading }: Props) {
  const [selected, setSelected] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 text-sm">← Dashboard</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Quiz Arena</h1>
          <p className="text-slate-400 text-sm">AI generates questions based on your weak spots</p>
        </div>
      </div>

      {/* Difficulty */}
      <div className="card mb-6">
        <h2 className="font-medium text-slate-300 mb-3">Select Difficulty</h2>
        <div className="flex gap-3">
          {(Object.entries(DIFF_CONFIG) as [string, typeof DIFF_CONFIG.easy][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key as 'easy' | 'medium' | 'hard')}
              className={`flex-1 border rounded-xl p-3 transition-all ${
                difficulty === key
                  ? cfg.color + ' border-2'
                  : 'border-[#1e3a5f] bg-[#1a1a2e] text-slate-400 hover:border-slate-500'
              }`}
            >
              <div className="font-medium text-sm">{cfg.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{cfg.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Grid */}
      <div className="card mb-6">
        <h2 className="font-medium text-slate-300 mb-3">Select Topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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

      {/* Hindsight note */}
      <div className="bg-violet-900/10 border border-violet-800/30 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-violet-400 text-lg">🧠</span>
        <div>
          <p className="text-sm text-violet-300 font-medium">Memory-powered questions</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Hindsight will personalise questions based on your past mistakes in this topic.
            The more you quiz, the smarter it gets.
          </p>
        </div>
      </div>

      <button
        onClick={() => selected && onStart(selected, difficulty)}
        disabled={!selected || loading}
        className="btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Generating your personalised quiz...'
          : selected
          ? `Start ${difficulty} quiz on ${selected} →`
          : 'Select a topic to begin'}
      </button>
    </div>
  )
}