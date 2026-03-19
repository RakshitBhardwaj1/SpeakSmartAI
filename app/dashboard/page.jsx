'use client'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'
import { BriefcaseBusiness, Sparkles } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

function Dashboard() {
  const { user } = useUser()
  const username = user?.firstName || user?.username || 'there'
  const [streak, setStreak] = React.useState(null)

  React.useEffect(() => {
    if (!user?.id) return

    const initializeStreak = async () => {
      try {
        const response = await fetch('/api/interview-streak/login', {
          method: 'POST',
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        setStreak(data?.streak || null)
      } catch (error) {
        console.error('Failed to initialize interview streak:', error)
      }
    }

    initializeStreak()
  }, [user?.id])

  return (
    <div className='space-y-8'>
      {streak?.isActive && (
        <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900'>
          <h2 className='text-sm font-semibold uppercase tracking-wide'>6-Day Interview Commitment</h2>
          <p className='mt-2 text-sm'>
            {streak.completedToday
              ? 'Today\'s interview is completed. Keep going tomorrow.'
              : 'Today\'s interview is pending. You must complete one interview today.'}
          </p>
          <p className='mt-1 text-xs text-amber-800'>
            Completed days: {streak.daysCompleted}/6. End date: {streak.streakEndDate}
          </p>
        </div>
      )}

      {/* Welcome Header */}
      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
        <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600'>
            <Sparkles className='h-3.5 w-3.5' />
            Interview Workspace
        </div>
        <h1 className='text-3xl font-bold tracking-tight text-slate-900 md:text-4xl'>
          Welcome back, <span className='text-slate-700'>{username}</span>
        </h1>
        <p className='mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base'>
          Manage your preparation workflow, launch new interview sessions, and review previous performance in one place.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <div className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700'>
            <BriefcaseBusiness className='h-4 w-4 text-slate-500' />
            Corporate Interview Practice
          </div>
          <div className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700'>
            <Sparkles className='h-4 w-4 text-slate-500' />
            AI-Assisted Feedback
          </div>
        </div>
      </div>

      {/* Action Card */}
      <section>
        <AddNewInterview/>
      </section>

      {/* Interview List Section */}
      <section className='pt-4'>
        <InterviewList/>
      </section>
    </div>
  )
}

export default Dashboard