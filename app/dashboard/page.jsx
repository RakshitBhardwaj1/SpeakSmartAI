import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'

function Dashboard() {
  return (
    <div>
      
      {/* Dashboard Section */}
      <div id="dashboard-section" className='px-10 pb-10 scroll-mt-20'>
        <div className='mb-8'>
          <h2 className='font-bold text-3xl text-gray-800 dark:text-gray-100'>Dashboard</h2>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>Create and Start Your Mock Interview Journey</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6'>
          <AddNewInterview/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
