import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Streak helpers
export async function getStreak(userId: string): Promise<number> {
  const streak = await redis.get<number>(`streak:${userId}`)
  return streak ?? 0
}

export async function updateStreak(userId: string): Promise<number> {
  const lastActive = await redis.get<number>(`last_active:${userId}`)
  const now = Date.now()
  const oneDayMs = 86400000

  let streak = await getStreak(userId)

  if (!lastActive || now - lastActive > oneDayMs * 2) {
    streak = 1
  } else if (now - lastActive > oneDayMs) {
    streak = streak + 1
  }

  await redis.set(`streak:${userId}`, streak)
  await redis.set(`last_active:${userId}`, now)
  return streak
}

// Quiz history helpers
export async function saveQuizResult(
  userId: string,
  topic: string,
  score: number,
  total: number
) {
  const key = `quiz_history:${userId}`
  const entry = { topic, score, total, timestamp: Date.now() }
  await redis.lpush(key, JSON.stringify(entry))
  await redis.ltrim(key, 0, 49) // keep last 50
}

export async function getQuizHistory(userId: string) {
  const raw = await redis.lrange(`quiz_history:${userId}`, 0, 19)
  return raw.map((r) => (typeof r === 'string' ? JSON.parse(r) : r))
}

// Session helpers
export async function setUserSession(userId: string, data: object) {
  await redis.set(`session:${userId}`, JSON.stringify(data), { ex: 86400 })
}

export async function getUserSession(userId: string) {
  const raw = await redis.get<string>(`session:${userId}`)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}