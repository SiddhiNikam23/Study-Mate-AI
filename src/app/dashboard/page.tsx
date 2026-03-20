'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell
} from 'recharts'

interface DashboardData {
  dnaSummary: string
  recentMistakes: string[]
  streak: number
  topicAverages: { topic: string; avg: number }[]
  quizHistory: { topic: string; score: number; total: number; timestamp: number }[]
}

const COLORS = ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#8b5cf6', '#a78bfa']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dna')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  const radarData = (data?.topicAverages ?? []).map((t) => ({
    topic: t.topic.split(' ')[0],
    score: t.avg,
    fullMark: 100,
  }))

  const hasData = radarData.length > 0

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your memory-powered learning overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/quiz" className="btn-primary">Start Quiz</Link>
          <Link href="/code" className="btn-secondary">Code Arena</Link>
          <Link href="/dna" className="btn-secondary">My DNA</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Day Streak" value={`${data?.streak ?? 0} 🔥`} sub="Keep it going!" color="violet" />
        <StatCard label="Quizzes Done" value={String(data?.quizHistory?.length ?? 0)} sub="Total attempts" color="cyan" />
        <StatCard label="Topics Tracked" value={String(data?.topicAverages?.length ?? 0)} sub="In memory" color="emerald" />
        <StatCard label="Mistakes Logged" value={String(data?.recentMistakes?.length ?? 0)} sub="Stored in Hindsight" color="amber" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Radar Chart */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-1">Topic Performance Radar</h2>
          <p className="text-xs text-slate-500 mb-4">Based on your quiz history</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e3a5f" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Complete quizzes to see your radar" />
          )}
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-1">Score by Topic</h2>
          <p className="text-xs text-slate-500 mb-4">Average scores across attempts</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.topicAverages ?? []} barSize={28}>
                <XAxis
                  dataKey="topic"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => v.split(' ')[0]}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#16213e', border: '1px solid #1e3a5f', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {(data?.topicAverages ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Complete quizzes to see scores" />
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* DNA Summary */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧬</span>
            <h2 className="font-semibold text-slate-200">Your Learning DNA</h2>
            <span className="text-xs bg-violet-900/40 text-violet-400 px-2 py-0.5 rounded-full border border-violet-700/40">
              Hindsight Memory
            </span>
          </div>
          {data?.dnaSummary ? (
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {data.dnaSummary}
            </p>
          ) : (
            <div className="text-slate-500 text-sm">
              <p>No memory yet. Complete a quiz or coding challenge to build your DNA profile.</p>
              <Link href="/quiz" className="text-violet-400 hover:text-violet-300 mt-2 inline-block">
                Take your first quiz →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Mistakes */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <h2 className="font-semibold text-slate-200">Recent Mistakes</h2>
          </div>
          {data?.recentMistakes && data.recentMistakes.length > 0 ? (
            <ul className="space-y-2">
              {data.recentMistakes.slice(0, 6).map((m, i) => (
                <li key={i} className="text-xs text-slate-400 bg-[#1a1a2e] rounded-lg p-2.5 leading-relaxed border border-[#1e3a5f]/50">
                  {m.replace('MISTAKE: ', '').substring(0, 100)}
                  {m.length > 100 ? '...' : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No mistakes logged yet. Start a quiz!</p>
          )}
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-6 card">
        <h2 className="font-semibold text-slate-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/quiz', icon: '📝', label: 'New Quiz', sub: 'AI-generated questions' },
            { href: '/code', icon: '💻', label: 'Code Arena', sub: 'HackerRank-style' },
            { href: '/dna', icon: '🧬', label: 'DNA Profile', sub: 'Your learning patterns' },
            { href: '/study-plan', icon: '📅', label: 'Study Plan', sub: 'Smart schedule' },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="bg-[#1a1a2e] hover:bg-[#1e2a4e] border border-[#1e3a5f] rounded-xl p-4 transition-all duration-200 group">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="font-medium text-slate-200 text-sm group-hover:text-violet-300 transition-colors">
                {a.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{a.sub}</div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub: string; color: string
}) {
  const colors: Record<string, string> = {
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  }
  return (
    <div className="card">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color] ?? 'text-slate-200'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[280px] flex items-center justify-center">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading your dashboard...</p>
      </div>
    </div>
  )
}