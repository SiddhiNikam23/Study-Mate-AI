"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isRegister = pathname === '/register'
  const isLogin = pathname === '/login'
  const isDashboard = pathname === '/dashboard'
  const isLightNav = isHome || isDashboard

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${
      isLightNav
        ? 'bg-white/90 border-blue-200/80'
        : 'bg-[#0f0f1a]/80 border-[#1e3a5f]/50'
    }`}>
      <div className={`max-w-7xl mx-auto px-6 ${isHome ? 'h-16' : 'h-14'} flex items-center justify-between`}>
        <Link href="/" className={`font-bold ${isHome ? 'text-xl' : 'text-lg'} tracking-tight ${isLightNav ? 'text-blue-700' : 'text-violet-400'}`}>
          StudyMate AI
        </Link>
        <div className="flex items-center gap-1">
          {!isHome && !isRegister && !isLogin && [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/quiz', label: 'Quiz' },
            { href: '/code', label: 'Code' },
            { href: '/dna', label: 'DNA' },
            { href: '/study-plan', label: 'Plan' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                isLightNav
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e3a5f]/40'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isHome && (
            <>
              <Link href="/login" className="text-sm font-medium text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors ml-1">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium text-white px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}