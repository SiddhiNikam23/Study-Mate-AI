'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error ?? 'Registration failed')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-[#eef5ff] to-[#e8f1ff] px-6 py-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_30px_90px_rgba(30,64,175,0.14)]">
        <div className="p-8 lg:p-10 bg-[#0f172a] text-slate-100">
          <span className="inline-flex px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-xs text-blue-200 mb-5">
            Join StudyMate AI
          </span>
          <h1 className="text-3xl font-bold mb-3">Build Logic. Track Progress. Crack Interviews.</h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Create your account to start personalized quiz practice, code recovery study guides,
            and weak-topic study plans designed for DSA learners.
          </p>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• Adaptive quiz and coding practice</p>
            <p>• Memory-based weak topic tracking</p>
            <p>• Smart study plans for interview prep</p>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 mb-6">Start your AI-guided programming journey.</p>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-4">
            Already have an account? <Link href="/login" className="text-blue-700 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
