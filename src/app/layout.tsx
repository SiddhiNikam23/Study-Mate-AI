import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/dashboard/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyMate AI — Memory-Powered Learning',
  description: 'The AI study companion that remembers your mistakes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  )
}