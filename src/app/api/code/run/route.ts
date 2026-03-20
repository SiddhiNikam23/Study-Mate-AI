import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code, testCases } = await req.json()

    // For hackathon demo: simulate running by checking
    // if the code contains meaningful implementation
    const hasImplementation = code.length > 50 &&
      !code.includes('pass') &&
      !code.includes('# Your code here')

    if (!hasImplementation) {
      return NextResponse.json({
        output: 'No implementation found. Write your solution and try again.',
        passed: false,
        results: testCases.map((tc: { input: string; expected: string }) => ({
          input: tc.input,
          expected: tc.expected,
          actual: 'Not implemented',
          passed: false,
        })),
      })
    }

    // Use Groq to evaluate the code against test cases
    const { generateWithGroq } = await import('@/lib/groq')

    const evalPrompt = `Evaluate this Python code against the test cases.
Code:
${code}

Test cases:
${testCases.map((tc: { input: string; expected: string }, i: number) =>
  `${i + 1}. Input: ${tc.input} | Expected: ${tc.expected}`
).join('\n')}

Respond ONLY with JSON:
{
  "passed": true/false,
  "output": "brief output or error message",
  "results": [
    { "input": "...", "expected": "...", "actual": "...", "passed": true/false }
  ]
}`

    const raw = await generateWithGroq(
      'You are a Python code evaluator. Return only valid JSON.',
      evalPrompt,
      800
    )
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Code run error:', err)
    return NextResponse.json({
      output: 'Evaluation error. Check your code syntax.',
      passed: false,
      results: [],
    })
  }
}