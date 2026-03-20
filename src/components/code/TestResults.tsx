interface Props {
  output: string
  testCases: { input: string; expected: string }[]
  solved: boolean
  topic?: string
  challengeTitle?: string
  failedAttempts?: number
  loadingGuide?: boolean
  onRetryConcept?: () => void
  studyGuide?: {
    title: string
    weakConcepts: string[]
    stepsToReview: string[]
    retryChecklist: string[]
    motivationLine: string
  } | null
}

export default function TestResults({
  output,
  testCases,
  solved,
  topic = '',
  challengeTitle = '',
  failedAttempts = 0,
  loadingGuide = false,
  onRetryConcept,
  studyGuide = null,
}: Props) {
  const weakConceptsParam = studyGuide?.weakConcepts?.length
    ? encodeURIComponent(studyGuide.weakConcepts.join('|'))
    : ''
  const studyHref = `/code/study?topic=${encodeURIComponent(topic)}&challenge=${encodeURIComponent(challengeTitle)}&weakConcepts=${weakConceptsParam}`

  if (!output) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Run your code to see results</p>
        <p className="text-xs text-slate-600 mt-1">Press ▶ Run in the top bar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {solved ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-emerald-700 font-semibold">All test cases passed!</p>
          <p className="text-xs text-slate-600 mt-1">Hindsight has noted your progress.</p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-700 text-sm font-medium">Some tests failed</p>
          <p className="text-xs text-slate-600 mt-0.5">Check the output below and use hints if needed.</p>
        </div>
      )}

      {!solved && failedAttempts >= 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-700 font-medium text-sm mb-1">Study Guide Unlocked (after 3 attempts)</p>
          <p className="text-xs text-slate-600 mb-3">
            Study the following topics and retry the concept.
          </p>

          {loadingGuide ? (
            <p className="text-xs text-amber-700">Preparing your personalised study guide...</p>
          ) : studyGuide ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-amber-800 font-medium mb-1">{studyGuide.title}</p>
                <div className="flex flex-wrap gap-2">
                  {studyGuide.weakConcepts.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] bg-white border border-amber-200 px-2 py-1 rounded-lg text-amber-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-700 mb-1">What to study now</p>
                <div className="space-y-1">
                  {studyGuide.stepsToReview.map((step, index) => (
                    <p key={`${step}-${index}`} className="text-xs text-slate-600">{index + 1}. {step}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-700 mb-1">Before retry checklist</p>
                <div className="space-y-1">
                  {studyGuide.retryChecklist.map((item, index) => (
                    <p key={`${item}-${index}`} className="text-xs text-slate-600">• {item}</p>
                  ))}
                </div>
              </div>

              <p className="text-xs text-emerald-700">{studyGuide.motivationLine}</p>

              <button
                onClick={onRetryConcept}
                className="btn-primary text-sm px-4 py-2"
              >
                Re-try The Concept →
              </button>
              <a href={studyHref} className="btn-secondary text-sm px-4 py-2 inline-block">
                Start Study →
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Study arrays/edge cases/dry runs for this topic, then retry the concept.
            </p>
          )}
        </div>
      )}

      {/* Output */}
      <div>
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Output</h3>
        <pre className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 font-mono overflow-x-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>

      {/* Test cases */}
      <div>
        <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Test Cases</h3>
        <div className="space-y-2">
          {testCases.map((tc, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 font-mono text-xs">
              <div className="text-slate-700">
                <span className="text-blue-700">Input:</span> {tc.input}
              </div>
              <div className="text-slate-700 mt-1">
                <span className="text-emerald-700">Expected:</span> {tc.expected}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}