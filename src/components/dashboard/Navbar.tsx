import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-[#1e3a5f]/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-violet-400 text-lg tracking-tight">
          StudyMate AI
        </Link>
        <div className="flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/quiz', label: 'Quiz' },
            { href: '/code', label: 'Code' },
            { href: '/dna', label: 'DNA' },
            { href: '/study-plan', label: 'Plan' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-[#1e3a5f]/40 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}