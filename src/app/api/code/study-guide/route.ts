import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { recallMemories } from '@/lib/hindsight'
import { DEMO_USER_ID } from '@/lib/constants'

interface StudyGuideResponse {
  title: string
  weakConcepts: string[]
  stepsToReview: string[]
  retryChecklist: string[]
  motivationLine: string
}

function parseGuide(raw: string): StudyGuideResponse | null {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as Partial<StudyGuideResponse>
    if (!parsed || typeof parsed !== 'object') return null

    return {
      title: parsed.title || 'Study Guide',
      weakConcepts: Array.isArray(parsed.weakConcepts) ? parsed.weakConcepts : [],
      stepsToReview: Array.isArray(parsed.stepsToReview) ? parsed.stepsToReview : [],
      retryChecklist: Array.isArray(parsed.retryChecklist) ? parsed.retryChecklist : [],
      motivationLine: parsed.motivationLine || 'Review the key concepts and try again.',
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      topic,
      title,
      description,
      code,
      output,
      attempts,
    }: {
      topic: string
      title: string
      description: string
      code: string
      output: string
      attempts: number
    } = await req.json()

    const memories = await recallMemories(
      DEMO_USER_ID,
      `coding mistakes for ${topic}`,
      5
    )
    const memoryContext = memories
      .map((m) => m.content ?? m.text ?? '')
      .filter(Boolean)
      .join('\n')

    const systemPrompt = `You are an expert DSA coding mentor.
Generate a concise study guide when a student fails coding attempts repeatedly.
Return valid JSON only.`

    const userPrompt = `Student failed ${attempts} attempts on this challenge.

Topic: ${topic}
Problem: ${title}
Problem summary:
${description}

Current code:
${code}

Latest output:
${output}

Past mistake memory:
${memoryContext || 'No prior memory'}

Return ONLY this JSON:
{
  "title": "Study this before retry",
  "weakConcepts": ["concept 1", "concept 2", "concept 3"],
  "stepsToReview": ["what to revise first", "what examples to practice", "what to avoid"],
  "retryChecklist": ["edge cases checked", "complexity validated", "dry run done"],
  "motivationLine": "encouraging one-line retry message"
}`

    const raw = await generateWithGroq(systemPrompt, userPrompt, 700)
    const guide = parseGuide(raw)

    if (!guide) {
      return NextResponse.json({
        success: true,
        guide: {
          title: 'Study this before retry',
          weakConcepts: [topic, 'Edge cases', 'Dry run validation'],
          stepsToReview: [
            `Revise the core pattern for ${topic}.`,
            'Practice 2 similar examples by hand.',
            'Validate your approach on smallest and largest test inputs.',
          ],
          retryChecklist: [
            'Handle empty/single-element cases',
            'Check loop boundaries and indexes',
            'Dry run at least one failing example',
          ],
          motivationLine: 'You are close. Study these points and retry the concept.',
        },
      })
    }

    return NextResponse.json({ success: true, guide })
  } catch (err) {
    console.error('Code study guide error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to generate study guide' },
      { status: 500 }
    )
  }
}
