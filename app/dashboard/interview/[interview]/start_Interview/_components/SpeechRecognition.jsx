"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import useSpeechToText from 'react-hook-speech-to-text'

function SpeechRecognition() {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  return (
    <div className='flex flex-col items-center'>
      <Button 
        variant='outline' 
        size="sm" 
        className="my-10"
        onClick={isRecording ? stopSpeechToText : startSpeechToText}
      >
        {isRecording ? 'Stop Recording' : 'Record Answer'}
      </Button>
      
      {isRecording && (
        <div className='text-center mb-4'>
          <span className='text-red-500 font-semibold'>● Recording...</span>
        </div>
      )}
      
      {error && (
        <div className='text-red-500 text-sm mb-4'>
          Error: {error}
        </div>
      )}
      
      {(results.length > 0 || interimResult) && (
        <div className='w-full bg-secondary p-4 rounded-lg'>
          <h3 className='font-semibold mb-2'>Your Answer:</h3>
          <div className='space-y-2'>
            {results.map((result) => (
              <p key={result.timestamp} className='text-sm'>
                {result.transcript}
              </p>
            ))}
            {interimResult && (
              <p className='text-sm text-gray-500 italic'>{interimResult}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeechRecognition
