export interface User {
  id: string
  name: string
  email: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
}

export interface QuizAttempt {
  questionId: string
  question: string
  topic: string
  options?: string[]  
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  timeSpent: number
  timestamp: number
}

export interface CodeChallenge {
  id: string
  title: string
  description: string
  starterCode: string
  testCases: { input: string; expected: string }[]
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  hints: string[]
}

export interface UserDNA {
  conceptMistakes: Record<string, number>
  patternMistakes: {
    offByOne: number
    edgeCases: number
    wrongComplexity: number
    syntaxErrors: number
    logicErrors: number
  }
  behaviour: {
    avgTimePerQuestion: number
    skipRate: number
    hintUsageRate: number
    streakDays: number
  }
  weakTopics: string[]
  strongTopics: string[]
}

export interface StudyPlan {
  date: string
  sessions: {
    topic: string
    duration: number
    type: 'quiz' | 'coding' | 'revision'
    priority: 'high' | 'medium' | 'low'
  }[]
}