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

interface CodeStudyGuide {
  title: string
  weakConcepts: string[]
  stepsToReview: string[]
  retryChecklist: string[]
  motivationLine: string
}

export default function CodeEditor({ challenge, topic, difficulty, onExit }: Props) {
  const [code, setCode] = useState(challenge.starterCode)
  const [activeTab, setActiveTab] = useState<Tab>('problem')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [studyGuide, setStudyGuide] = useState<CodeStudyGuide | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(false)
  const editorRef = useRef<unknown>(null)

  async function fetchStudyGuide(nextFailedAttempts: number, latestOutput: string) {
    setLoadingGuide(true)
    try {
      const res = await fetch('/api/code/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          title: challenge.title,
          description: challenge.description,
          code,
          output: latestOutput,
          attempts: nextFailedAttempts,
        }),
      })
      const data = await res.json()
      if (data.success && data.guide) {
        setStudyGuide(data.guide)
      }
    } catch {
      // Keep silent fallback; UI still works without guide.
    } finally {
      setLoadingGuide(false)
    }
  }

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
          topic,
          problemTitle: challenge.title,
        }),
      })
      const data = await res.json()
      setOutput(data.output ?? 'No output')
      if (data.passed) {
        setSolved(true)
        setStudyGuide(null)
      } else {
        setSolved(false)
        const nextFailedAttempts = failedAttempts + 1
        setFailedAttempts(nextFailedAttempts)
        if (nextFailedAttempts >= 3) {
          void fetchStudyGuide(nextFailedAttempts, data.output ?? 'No output')
        }
      }
      setActiveTab('results')
    } catch {
      setOutput('Error running code. Check the console.')
      const nextFailedAttempts = failedAttempts + 1
      setFailedAttempts(nextFailedAttempts)
      if (nextFailedAttempts >= 3) {
        void fetchStudyGuide(nextFailedAttempts, 'Error running code. Check the console.')
      }
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
    <div className="h-screen flex flex-col overflow-hidden bg-[#f3f8ff]">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-blue-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-slate-600 hover:text-slate-900 text-sm">← Exit</button>
          <span className="text-slate-900 font-medium text-sm">{challenge.title}</span>
          <span className={`badge-${difficulty}`}>{difficulty}</span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{topic}</span>
        </div>
        <div className="flex items-center gap-2">
          {solved && (
            <span className="text-emerald-400 text-sm font-medium animate-pulse">✓ Solved!</span>
          )}
          <span className="text-xs text-slate-600">Attempts: {attempts}</span>
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
        <div className="w-[42%] flex flex-col border-r border-blue-200 overflow-hidden bg-white">

          {/* Tabs */}
          <div className="flex border-b border-blue-200 flex-shrink-0 bg-white flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm transition-colors ${
                  activeTab === t.id
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
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
                topic={topic}
                challengeTitle={challenge.title}
                failedAttempts={failedAttempts}
                studyGuide={studyGuide}
                loadingGuide={loadingGuide}
                onRetryConcept={() => setActiveTab('problem')}
              />
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Monaco Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-blue-200 flex-shrink-0 bg-white">
            <span className="text-xs text-slate-600">Python 3</span>
            <button
              onClick={() => setCode(challenge.starterCode)}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
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
              theme="vs-light"
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
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{challenge.title}</h2>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {challenge.description}
        </p>
      </div>

      {challenge.testCases?.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">
            Examples
          </h3>
          <div className="space-y-2">
            {challenge.testCases.slice(0, 3).map((tc, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200 font-mono text-xs">
                <div className="text-slate-700">
                  <span className="text-blue-700">Input:</span> {tc.input}
                </div>
                <div className="text-slate-700 mt-1">
                  <span className="text-emerald-700">Output:</span> {tc.expected}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-medium mb-1">🧠 Personalised challenge</p>
        <p className="text-xs text-slate-600">
          This problem was generated based on your past coding mistakes stored in Hindsight memory.
        </p>
      </div>
    </div>
  )
}