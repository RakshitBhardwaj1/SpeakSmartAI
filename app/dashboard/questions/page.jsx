import React from 'react'
import { BrainCircuit, Briefcase, MessageSquareQuote, Sparkles, Target } from 'lucide-react'

const questionGroups = [
  {
    title: 'General Interview Questions',
    icon: MessageSquareQuote,
    questions: [
      'Tell me about yourself.',
      'What are your biggest strengths and weaknesses?',
      'Why do you want to work with us?',
      'Describe a challenge and how you solved it.'
    ]
  },
  {
    title: 'Behavioral Questions',
    icon: Target,
    questions: [
      'Tell me about a time you handled conflict in a team.',
      'Describe a time you had to meet a tight deadline.',
      'Give an example of when you showed leadership.',
      'How do you prioritize tasks when everything feels urgent?'
    ]
  },
  {
    title: 'Role-Specific Questions',
    icon: Briefcase,
    questions: [
      'Which tools and technologies are you strongest in?',
      'How do you stay updated with industry trends?',
      'Walk me through a project you are proud of.',
      'How would you approach your first 90 days in this role?'
    ]
  }
]

function QuestionsPage() {
  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10'>
        <div className='absolute -left-10 -top-10 h-44 w-44 rounded-full bg-orange-100/70 blur-2xl' />
        <div className='relative z-10'>
          <p className='mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700'>
            <Sparkles className='h-3.5 w-3.5' />
            Interview Preparation
          </p>
          <h1 className='text-3xl font-black tracking-tight text-slate-900 md:text-5xl'>Top Questions to Practice</h1>
          <p className='mt-3 max-w-3xl text-sm text-slate-600 md:text-base'>
            Use this question bank to sharpen your answers, structure your stories, and build confidence before real interviews.
          </p>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
        {questionGroups.map((group) => {
          const Icon = group.icon
          return (
            <article key={group.title} className='premium-card p-6'>
              <div className='inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200'>
                <Icon className='h-5 w-5' />
              </div>
              <h2 className='mt-4 text-lg font-extrabold text-slate-900 md:text-xl'>{group.title}</h2>
              <ul className='mt-4 space-y-3'>
                {group.questions.map((question) => (
                  <li key={question} className='rounded-xl border border-slate-200/80 bg-white/70 p-3 text-sm leading-relaxed text-slate-700'>
                    {question}
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </section>

      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
        <div className='flex items-start gap-3'>
          <div className='mt-1 rounded-lg bg-teal-50 p-2 text-teal-700'>
            <BrainCircuit className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-slate-900'>Pro Tip</h2>
            <p className='mt-1 text-sm text-slate-600 md:text-base'>
              Practice answering out loud in under two minutes per question, then review your pace, clarity, and confidence.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default QuestionsPage
