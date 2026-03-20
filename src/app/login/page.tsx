'use client'

import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-[#edf4ff] px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border border-blue-100 rounded-3xl p-10 shadow-[0_25px_80px_rgba(30,64,175,0.12)]">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Login</h1>
        <p className="text-base text-slate-500 mb-7">
          Authentication screen placeholder for StudyMate AI.
        </p>
        <div className="space-y-4">
          <input className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 placeholder-slate-500 bg-white" placeholder="Email" />
          <input className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 placeholder-slate-500 bg-white" placeholder="Password" type="password" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 text-base font-semibold">
            Login
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-5">
          New user? <Link href="/register" className="text-blue-700 hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  )
}
