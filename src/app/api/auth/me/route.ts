import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sm_session')?.value
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 })
    }

    const rawSession = await redis.get<string>(`auth:session:${token}`)
    if (!rawSession) {
      return NextResponse.json({ success: false, user: null }, { status: 401 })
    }

    const session = typeof rawSession === 'string' ? JSON.parse(rawSession) : rawSession

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
      },
    })
  } catch (err) {
    console.error('Auth me error:', err)
    return NextResponse.json({ success: false, user: null }, { status: 500 })
  }
}
