import { NextRequest, NextResponse } from 'next/server'
import { generateWithGroq } from '@/lib/groq'
import { recallMemories } from '@/lib/hindsight'
import { DEMO_USER_ID } from '@/lib/constants'

interface TopicStudyPayload {
  title: string
  topic: string
  conceptSummary: string[]
  commonMistakes: string[]
  stepByStepApproach: string[]
  workedExample: {
    input: string
    thoughtProcess: string[]
    output: string
  }
  practiceTasks: string[]
  retryPlan: string[]
}

function safeStudyPayload(topic: string, challengeTitle: string): TopicStudyPayload {
  return {
    title: `Complete Study Guide: ${topic}`,
    topic,
    conceptSummary: [
      `Core pattern behind ${topic}.`,
      'How to identify input/output constraints quickly.',
      'How to convert a brute-force idea into an efficient solution.',
    ],
    commonMistakes: [
      'Missing edge cases such as empty input, single element, or duplicates.',
      'Off-by-one index boundaries in loops and pointers.',
      'Not validating algorithm complexity before coding.',
    ],
    stepByStepApproach: [
      'Write a plain-English strategy in 3 lines before code.',
      'Dry-run on one simple and one tricky input.',
      'Implement incrementally and verify each block.',
      'Run full edge-case checklist before final submit.',
    ],
    workedExample: {
      input: 'Sample input from the current challenge',
      thoughtProcess: [
        `Understand what ${challengeTitle || 'the problem'} expects.`,
        'Choose the right data structure for fast lookup/update.',
        'Simulate the algorithm once to verify correctness.',
      ],
      output: 'Expected output based on the dry run',
    },
    practiceTasks: [
      `Solve 2 easy + 1 medium ${topic} problems with a 15-minute timer each.`,
      'Write edge cases before coding for each problem.',
      'After solving, explain your approach aloud in under 60 seconds.',
    ],
    retryPlan: [
      'Re-open current challenge and write pseudocode first.',
      'Implement with checkpoints after each function block.',
      'Test on custom edge cases before pressing Run.',
      'Retry the challenge immediately after this study session.',
    ],
  }
}

function parseStudy(raw: string): TopicStudyPayload | null {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as TopicStudyPayload
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      topic,
      challengeTitle = '',
      weakConcepts = [],
    }: {
      topic: string
      challengeTitle?: string
      weakConcepts?: string[]
    } = await req.json()

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 })
    }

    const memories = await recallMemories(DEMO_USER_ID, `coding mistakes in ${topic}`, 5)
    const memoryContext = memories
      .map((m) => m.content ?? m.text ?? '')
      .filter(Boolean)
      .join('\n')

    const systemPrompt = 'You are an expert coding teacher. Return only valid JSON.'
    const userPrompt = `Create a complete topic study guide for coding interview prep.

Topic: ${topic}
Current challenge title: ${challengeTitle}
Weak concepts from recent failed attempts: ${Array.isArray(weakConcepts) && weakConcepts.length ? weakConcepts.join(', ') : 'Not provided'}
Mistake memory context:
${memoryContext || 'No memory context'}

Return ONLY this JSON:
{
  "title": "Complete Study Guide: topic",
  "topic": "topic",
  "conceptSummary": ["point 1", "point 2", "point 3"],
  "commonMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "stepByStepApproach": ["step 1", "step 2", "step 3", "step 4"],
  "workedExample": {
    "input": "example input",
    "thoughtProcess": ["thought 1", "thought 2", "thought 3"],
    "output": "example output"
  },
  "practiceTasks": ["task 1", "task 2", "task 3"],
  "retryPlan": ["retry step 1", "retry step 2", "retry step 3", "retry step 4"]
}`

    const raw = await generateWithGroq(systemPrompt, userPrompt, 1200)
    const parsed = parseStudy(raw)

    return NextResponse.json({
      success: true,
      study: parsed ?? safeStudyPayload(topic, challengeTitle),
    })
  } catch (err) {
    console.error('Topic study generation error:', err)
    return NextResponse.json({ success: false, error: 'Failed to build study content' }, { status: 500 })
  }
}
