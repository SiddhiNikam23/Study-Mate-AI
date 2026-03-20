interface Props {
  output: string
  testCases: { input: string; expected: string }[]
  solved: boolean
}

export default function TestResults({ output, testCases, solved }: Props) {
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
        <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-emerald-400 font-semibold">All test cases passed!</p>
          <p className="text-xs text-slate-400 mt-1">Hindsight has noted your progress.</p>
        </div>
      ) : (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3">
          <p className="text-red-400 text-sm font-medium">Some tests failed</p>
          <p className="text-xs text-slate-400 mt-0.5">Check the output below and use hints if needed.</p>
        </div>
      )}

      {/* Output */}
      <div>
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Output</h3>
        <pre className="bg-[#1a1a2e] border border-[#1e3a5f]/50 rounded-lg p-3 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>

      {/* Test cases */}
      <div>
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Test Cases</h3>
        <div className="space-y-2">
          {testCases.map((tc, i) => (
            <div key={i} className="bg-[#1a1a2e] rounded-lg p-3 border border-[#1e3a5f]/50 font-mono text-xs">
              <div className="text-slate-400">
                <span className="text-violet-400">Input:</span> {tc.input}
              </div>
              <div className="text-slate-400 mt-1">
                <span className="text-emerald-400">Expected:</span> {tc.expected}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}