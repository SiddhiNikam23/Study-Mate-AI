const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY!
const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_BASE_URL!

interface HindsightMemory {
  content: string
  metadata?: Record<string, unknown>
}

// ─── Core API helpers ────────────────────────────────────────────────────────

function bankUrl(bankId: string, path: string) {
  return `${HINDSIGHT_BASE_URL}/v1/default/banks/${bankId}${path}`
}

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${HINDSIGHT_API_KEY}`,
  }
}

// ─── Primitives ──────────────────────────────────────────────────────────────

export async function rememberFact(
  userId: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  const res = await fetch(bankUrl(`user_${userId}`, '/memories/retain'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      content,
      metadata: metadata ?? {},
    }),
  })
  if (!res.ok) throw new Error(`Hindsight retain failed: ${res.status}`)
  return res.json()
}

export async function recallMemories(
  userId: string,
  query: string,
  limit = 10
): Promise<HindsightMemory[]> {
  const res = await fetch(bankUrl(`user_${userId}`, '/memories/recall'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ query, limit }),
  })
  if (!res.ok) {
    console.warn(`Hindsight recall failed: ${res.status}`)
    return []
  }
  const data = await res.json()
  return data.memories ?? data.results ?? []
}

export async function reflectOnMemories(
  userId: string,
  query: string
): Promise<string> {
  const res = await fetch(bankUrl(`user_${userId}`, '/reflect'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    console.warn(`Hindsight reflect failed: ${res.status}`)
    return ''
  }
  const data = await res.json()
  return data.response ?? data.reflection ?? ''
}

// ─── High-level helpers ──────────────────────────────────────────────────────

export async function logMistake(
  userId: string,
  topic: string,
  question: string,
  wrongAnswer: string,
  correctAnswer: string
) {
  await rememberFact(
    userId,
    `MISTAKE: User got "${question}" wrong. They answered "${wrongAnswer}" but correct answer is "${correctAnswer}". Topic: ${topic}`,
    { type: 'mistake', topic, timestamp: Date.now() }
  )
}

export async function logCodeMistake(
  userId: string,
  problemTitle: string,
  errorType: string,
  code: string
) {
  await rememberFact(
    userId,
    `CODE MISTAKE: User failed "${problemTitle}" with error type "${errorType}". Code pattern logged.`,
    { type: 'code_mistake', errorType, problemTitle, timestamp: Date.now() }
  )
}

export async function logStudySession(
  userId: string,
  topic: string,
  score: number,
  timeSpent: number
) {
  await rememberFact(
    userId,
    `STUDY SESSION: Completed ${topic} quiz. Score: ${score}%. Time spent: ${timeSpent}s.`,
    { type: 'session', topic, score, timeSpent, timestamp: Date.now() }
  )
}

export async function getUserDNASummary(userId: string): Promise<string> {
  return reflectOnMemories(
    userId,
    "Summarize this student's: weak topics, recurring mistake patterns, coding errors, and behaviour (time management, hint usage, skip rate). Be specific and structured."
  )
}