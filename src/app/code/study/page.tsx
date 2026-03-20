'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface TopicStudy {
  title: string
  topic: string
  conceptSummary: string[]
  commonMistakes: string[]
  stepByStepApproach: string[]
  workedExample: {
    input: string
    thoughtProcess: string[]
    output: string
  }
  practiceTasks: string[]
  retryPlan: string[]
}

export default function CodeStudyPage() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') ?? ''
  const challengeTitle = searchParams.get('challenge') ?? ''
  const weakConceptsRaw = searchParams.get('weakConcepts') ?? ''

  const weakConcepts = useMemo(
    () => weakConceptsRaw.split('|').map((v) => v.trim()).filter(Boolean),
    [weakConceptsRaw]
  )

  const [loading, setLoading] = useState(true)
  const [study, setStudy] = useState<TopicStudy | null>(null)

  useEffect(() => {
    if (!topic) {
      setLoading(false)
      return
    }

    async function loadStudy() {
      setLoading(true)
      try {
        const res = await fetch('/api/code/topic-study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, challengeTitle, weakConcepts }),
        })
        const data = await res.json()
        if (data.success && data.study) {
          setStudy(data.study)
        }
      } finally {
        setLoading(false)
      }
    }

    void loadStudy()
  }, [topic, challengeTitle, weakConcepts])

  if (!topic) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <h1 className="text-xl font-semibold text-slate-200 mb-2">No topic selected</h1>
          <p className="text-sm text-slate-400 mb-5">Open this page from Code Arena study guide.</p>
          <Link href="/code" className="btn-primary">Back to Code Arena</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/code" className="text-slate-400 hover:text-slate-200 text-sm">← Back to Code Arena</Link>
        <span className="text-xs bg-violet-900/30 border border-violet-700/40 px-2 py-1 rounded-full text-violet-300">
          Full Topic Study
        </span>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-slate-300">Preparing complete study content...</p>
        </div>
      ) : !study ? (
        <div className="card text-center py-12">
          <p className="text-slate-300 mb-4">Could not load study content.</p>
          <Link href="/code" className="btn-secondary">Retry from Code Arena</Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="card">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{study.title}</h1>
            <p className="text-sm text-slate-400">Topic: {study.topic}</p>
            {challengeTitle && (
              <p className="text-xs text-slate-500 mt-1">From challenge: {challengeTitle}</p>
            )}
          </div>

          <Section title="Core Concepts" items={study.conceptSummary} tone="violet" />
          <Section title="Common Mistakes" items={study.commonMistakes} tone="red" />
          <Section title="Step-by-Step Approach" items={study.stepByStepApproach} tone="cyan" />

          <div className="card border border-emerald-800/40">
            <h2 className="font-semibold text-emerald-300 mb-2">Worked Example</h2>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300"><span className="text-slate-400">Input:</span> {study.workedExample.input}</p>
              <div>
                <p className="text-slate-400 mb-1">Thought process</p>
                <div className="space-y-1">
                  {study.workedExample.thoughtProcess.map((step, index) => (
                    <p key={`${step}-${index}`} className="text-slate-300">{index + 1}. {step}</p>
                  ))}
                </div>
              </div>
              <p className="text-slate-300"><span className="text-slate-400">Output:</span> {study.workedExample.output}</p>
            </div>
          </div>

          <Section title="Practice Tasks" items={study.practiceTasks} tone="amber" />
          <Section title="Retry Plan" items={study.retryPlan} tone="emerald" />

          <div className="card">
            <p className="text-sm text-slate-300 mb-3">
              After this study, go back and retry the same challenge.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/code" className="btn-primary">Reopen Code Arena</Link>
              <Link href="/study-plan" className="btn-secondary">Open Study Plan</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'violet' | 'red' | 'cyan' | 'amber' | 'emerald'
}) {
  const toneClass: Record<typeof tone, string> = {
    violet: 'text-violet-300 border-violet-800/40',
    red: 'text-red-300 border-red-800/40',
    cyan: 'text-cyan-300 border-cyan-800/40',
    amber: 'text-amber-300 border-amber-800/40',
    emerald: 'text-emerald-300 border-emerald-800/40',
  }

  return (
    <div className={`card border ${toneClass[tone]}`}>
      <h2 className={`font-semibold mb-2 ${toneClass[tone].split(' ')[0]}`}>{title}</h2>
      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map((item, index) => (
            <p key={`${item}-${index}`} className="text-sm text-slate-300">{index + 1}. {item}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No items available.</p>
      )}
    </div>
  )
}
