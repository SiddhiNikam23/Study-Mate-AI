import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomUUID } from 'crypto'
import { redis } from '@/lib/redis'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password }: RegisterPayload = await req.json()

    const cleanName = name?.trim()
    const cleanEmail = email?.trim().toLowerCase()
    const cleanPassword = password?.trim()

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 })
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const existing = await redis.get(`user:email:${cleanEmail}`)
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered. Please login.' }, { status: 409 })
    }

    const userId = `user_${randomUUID()}`
    const passwordHash = hashPassword(cleanPassword)

    const userRecord = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: Date.now(),
    }

    await Promise.all([
      redis.set(`user:email:${cleanEmail}`, JSON.stringify(userRecord)),
      redis.set(`user:id:${userId}`, JSON.stringify(userRecord)),
    ])

    const sessionToken = randomUUID()
    const sessionData = {
      userId,
      name: cleanName,
      email: cleanEmail,
      createdAt: Date.now(),
    }

    await redis.set(`auth:session:${sessionToken}`, JSON.stringify(sessionData), { ex: 60 * 60 * 24 * 7 })

    const res = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
      },
    })

    res.cookies.set('sm_session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
