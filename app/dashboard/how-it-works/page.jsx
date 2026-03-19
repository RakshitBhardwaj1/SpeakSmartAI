import React from 'react'
import Link from 'next/link'
import { Brain, Upload, Sparkles, Mic, BarChart3, ArrowRight } from 'lucide-react'

const steps = [
  {
    title: 'Create an Interview Session',
    description:
      'Start from your dashboard and set a target role or upload a resume so the AI can personalize every question.',
    icon: Upload,
    badge: 'Step 1'
  },
  {
    title: 'Practice With Smart Questions',
    description:
      'The platform generates role-focused interview prompts so each round feels like a real interview.',
    icon: Brain,
    badge: 'Step 2'
  },
  {
    title: 'Answer by Voice',
    description:
      'Speak naturally while recording. This helps you practice tone, clarity, and confidence under pressure.',
    icon: Mic,
    badge: 'Step 3'
  },
  {
    title: 'Get Instant AI Feedback',
    description:
      'Receive structured feedback with a score, strengths, and improvements you can apply right away.',
    icon: BarChart3,
    badge: 'Step 4'
  }
]

function HowItWorksPage() {
  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10'>
        <div className='absolute -right-10 -top-10 h-44 w-44 rounded-full bg-teal-100/60 blur-2xl' />
        <div className='relative z-10'>
          <p className='mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700'>
            <Sparkles className='h-3.5 w-3.5' />
            How SpeakSmartAI Works
          </p>
          <h1 className='text-3xl font-black tracking-tight text-slate-900 md:text-5xl'>
            Your Full Interview Workflow
          </h1>
          <p className='mt-3 max-w-3xl text-sm text-slate-600 md:text-base'>
            From setup to feedback, every stage is designed to help you improve quickly with focused, realistic practice.
          </p>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-5 md:grid-cols-2'>
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <article key={step.title} className='premium-card p-6'>
              <span className='inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                {step.badge}
              </span>
              <div className='mt-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200'>
                <Icon className='h-5 w-5' />
              </div>
              <h2 className='mt-4 text-xl font-bold text-slate-900'>{step.title}</h2>
              <p className='mt-2 text-sm leading-relaxed text-slate-600'>{step.description}</p>
            </article>
          )
        })}
      </section>

      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
        <h2 className='text-2xl font-black tracking-tight text-slate-900'>Ready to Start Practicing?</h2>
        <p className='mt-2 text-sm text-slate-600 md:text-base'>
          Jump back to your dashboard and create your next mock interview session.
        </p>
        <Link
          href='/dashboard'
          className='cta-shine mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700'
        >
          Go to Dashboard
          <ArrowRight className='h-4 w-4' />
        </Link>
      </section>
    </div>
  )
}

export default HowItWorksPage
