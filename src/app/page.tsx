import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-3xl">
        <div className="inline-block bg-violet-900/30 text-violet-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-violet-700/50">
          Powered by Hindsight Memory · Groq AI
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          StudyMate AI
        </h1>
        <p className="text-xl text-slate-400 mb-2">
          The first study platform that genuinely remembers you.
        </p>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto">
          Tracks your mistakes, learns your patterns, and builds a personalised
          study plan — so every minute you study actually counts.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
            Go to Dashboard →
          </Link>
          <Link href="/quiz" className="btn-secondary text-lg px-8 py-3">
            Start Quiz
          </Link>
          <Link href="/code" className="btn-secondary text-lg px-8 py-3">
            Code Arena
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { icon: '🧠', title: 'Memory-Powered', desc: 'Hindsight remembers every mistake across sessions' },
            { icon: '🧬', title: 'Your DNA Profile', desc: 'See your concept gaps, patterns and behaviour' },
            { icon: '🔥', title: 'Streak Tracker', desc: 'Stay consistent with daily learning streaks' },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-medium text-slate-200 mb-1">{f.title}</div>
              <div className="text-sm text-slate-400">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}