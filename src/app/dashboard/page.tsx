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
  const [userName, setUserName] = useState('Learner')

  useEffect(() => {
    Promise.all([
      fetch('/api/dna').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()).catch(() => ({ success: false })),
    ])
      .then(([dnaData, authData]) => {
        setData(dnaData)
        if (authData?.success && authData?.user?.name) {
          setUserName(authData.user.name)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  const radarData = (data?.topicAverages ?? []).map((t) => ({
    topic: t.topic.split(' ')[0],
    score: t.avg,
    fullMark: 100,
  }))

  const hasData = radarData.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf4ff]">
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 bg-white border border-blue-100 rounded-3xl p-6 shadow-[0_20px_60px_rgba(30,64,175,0.10)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Dashboard</p>
              <h1 className="text-3xl font-bold text-slate-900">Hello, {userName}</h1>
              <p className="text-slate-600 text-sm mt-1">Your memory-powered learning overview</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/quiz" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">Start Quiz</Link>
              <Link href="/code" className="px-4 py-2 rounded-xl bg-white text-slate-700 font-medium border border-slate-300 hover:bg-slate-50 transition-colors">Code Arena</Link>
              <Link href="/dna" className="px-4 py-2 rounded-xl bg-white text-slate-700 font-medium border border-slate-300 hover:bg-slate-50 transition-colors">My DNA</Link>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Day Streak" value={`${data?.streak ?? 0} 🔥`} sub="Keep it going!" color="violet" />
          <StatCard label="Quizzes Done" value={String(data?.quizHistory?.length ?? 0)} sub="Total attempts" color="cyan" />
          <StatCard label="Topics Tracked" value={String(data?.topicAverages?.length ?? 0)} sub="In memory" color="emerald" />
          <StatCard label="Mistakes Logged" value={String(data?.recentMistakes?.length ?? 0)} sub="Stored in memory" color="amber" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Radar Chart */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-1">Topic Performance Radar</h2>
            <p className="text-xs text-slate-500 mb-4">Based on your quiz history</p>
            {hasData ? (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: '#334155', fontSize: 12 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.28}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Complete quizzes to see your radar" />
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-1">Score by Topic</h2>
            <p className="text-xs text-slate-500 mb-4">Average scores across attempts</p>
            {hasData ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.topicAverages ?? []} barSize={28}>
                  <XAxis
                    dataKey="topic"
                    tick={{ fill: '#334155', fontSize: 11 }}
                    tickFormatter={(v) => v.split(' ')[0]}
                  />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10 }}
                    labelStyle={{ color: '#0f172a' }}
                    itemStyle={{ color: '#1d4ed8' }}
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

        {/* Quick Actions */}
        <div className="mb-6 bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/quiz', icon: '📝', label: 'New Quiz', sub: 'AI-generated questions' },
              { href: '/code', icon: '💻', label: 'Code Arena', sub: 'HackerRank-style' },
              { href: '/dna', icon: '🧬', label: 'DNA Profile', sub: 'Your learning patterns' },
              { href: '/study-plan', icon: '📅', label: 'Study Plan', sub: 'Smart schedule' },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl p-4 transition-all duration-200 group">
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="font-medium text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                  {a.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{a.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* DNA Summary */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧬</span>
              <h2 className="font-semibold text-slate-900">Your Learning DNA</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Memory AI
              </span>
            </div>
            {data?.dnaSummary ? (
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {data.dnaSummary}
              </p>
            ) : (
              <div className="text-slate-600 text-sm">
                <p>No memory yet. Complete a quiz or coding challenge to build your DNA profile.</p>
                <Link href="/quiz" className="text-blue-700 hover:text-blue-800 mt-2 inline-block font-medium">
                  Take your first quiz →
                </Link>
              </div>
            )}
          </div>

          {/* Recent Mistakes */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚠️</span>
              <h2 className="font-semibold text-slate-900">Recent Mistakes</h2>
            </div>
            {data?.recentMistakes && data.recentMistakes.length > 0 ? (
              <ul className="space-y-2">
                {data.recentMistakes.slice(0, 6).map((m, i) => (
                  <li key={i} className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 leading-relaxed border border-slate-200">
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
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub: string; color: string
}) {
  const colors: Record<string, string> = {
    violet: 'text-blue-700',
    cyan: 'text-sky-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color] ?? 'text-slate-900'}`}>{value}</p>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf4ff]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading your dashboard...</p>
      </div>
    </div>
  )
}