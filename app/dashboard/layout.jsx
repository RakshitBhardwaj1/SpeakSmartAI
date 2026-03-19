// import React from 'react'
// import Header from './_components/Header'
// import { Toaster } from '@/components/ui/sonner'
// function DashboardLayout({ children }) {
//   return (
//     <div className='min-h-screen pb-8'>
//       <Header />
//       <div className='mx-4 mt-8 mb-5 md:mx-10 lg:mx-20'>
//         <Toaster />
//         <div className='glass-panel rounded-3xl px-4 py-6 md:px-7 md:py-8'>
//           {children}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default DashboardLayout


import React from 'react'
import Header from './_components/Header'
import { Toaster } from '@/components/ui/sonner'

function DashboardLayout({ children }) {
  return (
    <div className='min-h-screen bg-slate-50 pb-12'>
      <Header />
      <div className='mx-auto mt-8 w-full max-w-7xl px-4 md:px-8 lg:px-10'>
        <Toaster />
        <div className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
