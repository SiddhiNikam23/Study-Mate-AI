'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Session {
  topic: string
  duration: number
  type: 'quiz' | 'coding' | 'revision'
  priority: 'high' | 'medium' | 'low'
  reason: string
}

interface DayPlan {
  day: number
  date: string
  sessions: Session[]
}

const TYPE_CONFIG = {
  quiz:     { icon: '📝', color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
  coding:   { icon: '💻', color: 'text-cyan-700',    bg: 'bg-cyan-50 border-cyan-200' },
  revision: { icon: '📖', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
}

const PRIORITY_CONFIG = {
  high:   { label: 'High',   class: 'badge-high' },
  medium: { label: 'Medium', class: 'badge-medium' },
  low:    { label: 'Low',    class: 'badge-low' },
}

export default function StudyPlanPage() {
  const [examDate, setExamDate]     = useState('')
  const [dailyHours, setDailyHours] = useState(2)
  const [plan, setPlan]             = useState<DayPlan[]>([])
  const [summary, setSummary]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [generated, setGenerated]   = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  async function generatePlan() {
    setLoading(true)
    setGenerated(false)
    try {
      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examDate, dailyHours }),
      })
      const data = await res.json()
      if (data.success) {
        setPlan(data.plan ?? [])
        setSummary(data.summary ?? '')
        setGenerated(true)
        setSelectedDay(1)
      } else {
        alert('Failed to generate plan. Make sure Groq API key is set.')
      }
    } catch {
      alert('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const totalMinutes = plan.reduce(
    (s, d) => s + d.sessions.reduce((ss, sess) => ss + sess.duration, 0), 0
  )
  const totalSessions = plan.reduce((s, d) => s + d.sessions.length, 0)
  const highPriority  = plan.reduce(
    (s, d) => s + d.sessions.filter(sess => sess.priority === 'high').length, 0
  )

  const activeDay = plan.find(d => d.day === selectedDay)

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf4ff]">
      <div className="p-6 w-full max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 text-sm">
          ← Dashboard
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Study Plan</h1>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
              Memory-Powered
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-0.5">
            AI builds your plan from Hindsight memory — your weak topics, mistakes, behaviour
          </p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-slate-900 mb-1">Generate Your Plan</h2>
        <p className="text-sm text-slate-600 mb-5">
          Hindsight analyses your mistake history and weak topics to build a personalised 7-day schedule.
        </p>

        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">Exam Date (optional)</label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="input-field w-48"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">
              Daily study hours: <span className="text-blue-700 font-medium">{dailyHours}h</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">1h</span>
              <input
                type="range" min={1} max={8} step={1} value={dailyHours}
                onChange={e => setDailyHours(Number(e.target.value))}
                className="w-40 accent-violet-500"
              />
              <span className="text-xs text-slate-500">8h</span>
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Analysing your memory...
              </span>
            ) : (
              generated ? 'Regenerate Plan' : 'Generate Plan →'
            )}
          </button>
        </div>

        {/* Hindsight note */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3">
          <span className="text-blue-600">🧠</span>
          <p className="text-xs text-slate-600">
            Your plan is personalised using Hindsight memory — topics you scored low on get
            scheduled first, subjects with repeated mistakes get extra revision sessions.
          </p>
        </div>
      </div>

      {/* Stats */}
      {generated && plan.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Days',     value: plan.length,                     color: 'text-violet-400' },
              { label: 'Total Sessions', value: totalSessions,                   color: 'text-cyan-400' },
              { label: 'Total Hours',    value: `${Math.round(totalMinutes/60)}h`, color: 'text-emerald-400' },
              { label: 'High Priority',  value: highPriority,                    color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-blue-100 rounded-xl p-4 text-center shadow-sm">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Summary banner */}
          {summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
              <span className="text-blue-600 text-lg flex-shrink-0">🎯</span>
              <div>
                <p className="text-xs text-blue-700 font-medium mb-0.5">Plan Summary</p>
                <p className="text-sm text-slate-700">{summary}</p>
              </div>
            </div>
          )}

          {/* Day selector + detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Day pills */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm lg:col-span-1">
              <h2 className="font-semibold text-slate-900 mb-3">7-Day Schedule</h2>
              <div className="space-y-2">
                {plan.map(day => {
                  const dayMinutes = day.sessions.reduce((s, sess) => s + sess.duration, 0)
                  const hasHigh    = day.sessions.some(s => s.priority === 'high')
                  return (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedDay === day.day
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            selectedDay === day.day ? 'text-blue-700' : 'text-slate-800'
                          }`}>
                            Day {day.day}
                          </span>
                          {hasHigh && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{Math.round(dayMinutes/60)}h</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {day.sessions.map(s => s.topic.split(' ')[0]).join(' · ')}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Day detail */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm lg:col-span-2">
              {activeDay ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">Day {activeDay.day}</h2>
                      <p className="text-xs text-slate-500">{activeDay.date}</p>
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeDay.sessions.reduce((s, sess) => s + sess.duration, 0)} min total
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeDay.sessions.map((sess, i) => {
                      const tc = TYPE_CONFIG[sess.type] ?? TYPE_CONFIG.revision
                      const pc = PRIORITY_CONFIG[sess.priority] ?? PRIORITY_CONFIG.low
                      return (
                        <div key={i}
                          className={`rounded-xl p-4 border ${tc.bg} transition-all`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span>{tc.icon}</span>
                              <div className="min-w-0">
                                <div className="font-medium text-slate-900 text-sm truncate">
                                  {sess.topic}
                                </div>
                                {sess.reason && (
                                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    {sess.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className={pc.class}>{pc.label}</span>
                              <span className={`text-xs font-medium ${tc.color}`}>
                                {sess.duration} min
                              </span>
                              <span className="text-xs text-slate-500 capitalize">{sess.type}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                    {activeDay.sessions[0]?.type === 'coding' ? (
                      <Link href="/code" className="btn-primary flex-1 text-center text-sm py-2">
                        Start coding session →
                      </Link>
                    ) : (
                      <Link href="/quiz" className="btn-primary flex-1 text-center text-sm py-2">
                        Start quiz session →
                      </Link>
                    )}
                    <button
                      onClick={() => setSelectedDay(d => d && d < plan.length ? d + 1 : d)}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      Next day →
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-slate-500 text-sm">Select a day to see details</p>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* Empty state */}
      {!generated && !loading && (
        <div className="bg-white border border-blue-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No plan generated yet</h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
            Hit Generate Plan above — Hindsight will analyse your mistake history
            and weak topics to build a personalised schedule.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/quiz" className="btn-secondary text-sm">
              Take a quiz first
            </Link>
            <button onClick={generatePlan} className="btn-primary text-sm">
              Generate anyway →
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}