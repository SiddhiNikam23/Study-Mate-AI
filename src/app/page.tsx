import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf4ff] text-slate-900">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 mb-5">
              AI Study Companion for Programmers
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900 mb-4">
              Learn DSA Faster,
              <span className="text-blue-600"> Fix Logic Gaps</span>,
              and Prepare for Interviews.
            </h1>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              StudyMate AI is built for beginner programmers, DSA learners, LeetCode users,
              interview prep students, and self-learners struggling with logic.
              It tracks your mistakes and guides what to study next.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              
              
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
              >
                Explore Demo
              </Link>
            </div>
            <div className="text-sm text-slate-500">
              Powered by memory-based learning and adaptive practice generation.
            </div>
          </div>

          <div className="bg-white/90 border border-blue-100 rounded-3xl p-6 shadow-[0_25px_80px_rgba(59,130,246,0.12)]">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Who Is This For?</h2>
            <div className="space-y-3">
              {[
                'Beginner programmers building coding confidence',
                'DSA learners practicing arrays, trees, DP and logic',
                'LeetCode users improving weak question patterns',
                'Interview prep students targeting weak sections',
                'Self-learners stuck on problem-solving consistency',
              ].map((item) => (
                <div key={item} className="flex gap-2 items-start text-sm text-slate-700">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Features We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Adaptive Quiz Practice',
              desc: 'Wrong quiz answers trigger more targeted questions on weak topics.',
            },
            {
              title: 'Code Arena Recovery Guide',
              desc: 'After repeated failed attempts, get topic-focused study guidance.',
            },
            {
              title: 'Weak Topic Study Plan',
              desc: 'Plans are built from weak quiz sections and wrong code attempts.',
            },
            {
              title: 'Learning DNA Dashboard',
              desc: 'Track your concept strengths, weak areas, and behavior patterns.',
            },
            {
              title: 'Smart Hints',
              desc: 'Hints adapt to your past mistakes so you learn the right concept.',
            },
            {
              title: 'Interview-Focused Progress',
              desc: 'Practice and revise in a flow designed for interview readiness.',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-black text-slate-200 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">StudyMate AI</p>
              <p className="text-sm text-slate-400 mt-1">
                AI Study Companion for beginner programmers, DSA learners, and interview prep.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              © 2026 StudyMate AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}