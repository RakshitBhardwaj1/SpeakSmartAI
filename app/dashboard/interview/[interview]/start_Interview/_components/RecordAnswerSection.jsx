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
    <div className="flex flex-col justify-center itens-center">
      <div className='flex flex-col my-10 justify-center items-center bg-white dark:bg-black p-5 rounded-lg border'>
      {!isWebcamOn ? (
        <Image src="/webcam.png" alt="webcam" width={100} height={100} className=' bg-black rounded-lg '/>
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
        className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
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
