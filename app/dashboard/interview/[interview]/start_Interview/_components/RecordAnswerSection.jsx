"use client"
import Webcam from 'react-webcam'
import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const SpeechRecognitionComponent = dynamic(
  () => import('./SpeechRecognition'),
  { ssr: false }
)

function RecordAnswerSection({ interviewQuestions, activeQuestionIndex, onQuestionChange, mockId }) {
  const [isWebcamOn, setIsWebcamOn] = useState(false)

  const handleNextQuestion = () => {
    console.log('RecordAnswerSection: Moving to next question from index:', activeQuestionIndex)
    if (onQuestionChange) {
      onQuestionChange(activeQuestionIndex + 1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className='premium-card my-6 flex w-full flex-col items-center justify-center p-5'>
      {!isWebcamOn ? (
        <Image src="/webcam.png" alt="webcam" width={100} height={100} className='rounded-lg bg-black '/>
      ) : (
        <Webcam
          style={{
            height:300,
            width:'100%',
            zIndex:10
          }}
          onUserMedia={() => setIsWebcamOn(true)}
          onUserMediaError={() => setIsWebcamOn(false)}
        />
      )}
      <button 
        onClick={() => setIsWebcamOn(!isWebcamOn)}
        className='mt-4 rounded-lg bg-gradient-to-r from-teal-600 to-orange-500 px-4 py-2 text-white transition hover:-translate-y-0.5 hover:from-teal-700 hover:to-orange-600'
      >
        {isWebcamOn ? 'Turn Off Webcam' : 'Turn On Webcam'}
      </button>
    </div>
    
    <SpeechRecognitionComponent 
      interviewQuestions={interviewQuestions}
      activeQuestionIndex={activeQuestionIndex}
      onNext={handleNextQuestion}
      mockId={mockId}
      onQuestionChange={onQuestionChange}
    />
    </div>
    
  )
}

export default RecordAnswerSection
