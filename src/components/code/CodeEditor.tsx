'use client'

import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { CodeChallenge } from '@/types'
import HintPanel from './HIntPanel'
import TestResults from './TestResults'

interface Props {
  challenge: CodeChallenge
  topic: string
  difficulty: string
  onExit: () => void
}

type Tab = 'problem' | 'hints' | 'results'

export default function CodeEditor({ challenge, topic, difficulty, onExit }: Props) {
  const [code, setCode] = useState(challenge.starterCode)
  const [activeTab, setActiveTab] = useState<Tab>('problem')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const editorRef = useRef<unknown>(null)

  async function runCode() {
    setRunning(true)
    setAttempts((a) => a + 1)
    try {
      // Client-side Python simulation via Pyodide-style check
      // For demo: check output against test cases using basic string match
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          testCases: challenge.testCases,
          language: 'python',
        }),
      })
      const data = await res.json()
      setOutput(data.output ?? 'No output')
      if (data.passed) setSolved(true)
      setActiveTab('results')
    } catch {
      setOutput('Error running code. Check the console.')
      setActiveTab('results')
    } finally {
      setRunning(false)
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'problem', label: 'Problem' },
    { id: 'hints',   label: `Hints ${attempts > 0 ? '🔥' : ''}` },
    { id: 'results', label: 'Results' },
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e3a5f] bg-[#0f0f1a] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-200 text-sm">← Exit</button>
          <span className="text-slate-200 font-medium text-sm">{challenge.title}</span>
          <span className={`badge-${difficulty}`}>{difficulty}</span>
          <span className="text-xs bg-[#1e3a5f] text-slate-400 px-2 py-0.5 rounded-full">{topic}</span>
        </div>
        <div className="flex items-center gap-2">
          {solved && (
            <span className="text-emerald-400 text-sm font-medium animate-pulse">✓ Solved!</span>
          )}
          <span className="text-xs text-slate-500">Attempts: {attempts}</span>
          <button
            onClick={runCode}
            disabled={running}
            className="btn-primary px-5 py-1.5 text-sm disabled:opacity-50"
          >
            {running ? 'Running...' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[42%] flex flex-col border-r border-[#1e3a5f] overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[#1e3a5f] flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm transition-colors ${
                  activeTab === t.id
                    ? 'text-violet-400 border-b-2 border-violet-500 bg-[#1a1a2e]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'problem' && (
              <ProblemPanel challenge={challenge} />
            )}
            {activeTab === 'hints' && (
              <HintPanel
                challenge={challenge}
                code={code}
                attempts={attempts}
                topic={topic}
              />
            )}
            {activeTab === 'results' && (
              <TestResults
                output={output}
                testCases={challenge.testCases}
                solved={solved}
              />
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Monaco Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e3a5f] flex-shrink-0">
            <span className="text-xs text-slate-400">Python 3</span>
            <button
              onClick={() => setCode(challenge.starterCode)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Reset code
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="python"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              onMount={(editor) => { editorRef.current = editor }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                padding: { top: 16 },
                suggest: { showKeywords: true },
                quickSuggestions: true,
                tabSize: 4,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProblemPanel({ challenge }: { challenge: CodeChallenge }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">{challenge.title}</h2>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {challenge.description}
        </p>
      </div>

      {challenge.testCases?.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Examples
          </h3>
          <div className="space-y-2">
            {challenge.testCases.slice(0, 3).map((tc, i) => (
              <div key={i} className="bg-[#1a1a2e] rounded-lg p-3 border border-[#1e3a5f]/50 font-mono text-xs">
                <div className="text-slate-400">
                  <span className="text-violet-400">Input:</span> {tc.input}
                </div>
                <div className="text-slate-400 mt-1">
                  <span className="text-emerald-400">Output:</span> {tc.expected}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-violet-900/10 border border-violet-800/30 rounded-xl p-3">
        <p className="text-xs text-violet-400 font-medium mb-1">🧠 Personalised challenge</p>
        <p className="text-xs text-slate-500">
          This problem was generated based on your past coding mistakes stored in Hindsight memory.
        </p>
      </div>
    </div>
  )
}