'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import useSpeechToText from 'react-hook-speech-to-text'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { GoogleGenerativeAI } from '@google/generative-ai'

function SpeechRecognition({ interviewQuestions = [], activeQuestionIndex = 0 }) {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  })

  const [userAnswer, setUserAnswer] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Debug props
  useEffect(() => {
    console.log('SpeechRecognition component loaded')
    console.log('Interview Questions:', interviewQuestions)
    console.log('Active Question Index:', activeQuestionIndex)
  }, [interviewQuestions, activeQuestionIndex])

  useEffect(() => {
    results.forEach((result) => {
      setUserAnswer((prevAnswer) => prevAnswer + result?.transcript)
    })
  }, [results])

  // Get feedback from Gemini AI
  const getFeedbackFromGemini = async (question, answer) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!apiKey) {
        console.error('Gemini API key not configured in env')
        toast.error('Gemini API key not configured')
        return null
      }

      console.log('Initializing Gemini AI...')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const feedbackPrompt = `You are an expert interview coach. Analyze the following interview answer and provide constructive feedback.

Question: ${question}

User Answer: ${answer}

Please provide your response in the following JSON format ONLY (no additional text, no markdown):
{
  "rating": <number between 1-10>,
  "feedback": "<3-5 line feedback highlighting areas of improvement, written in a constructive and professional tone>",
  "strengths": "<mention 1-2 key strengths of the answer>"
}

Important: Respond ONLY with valid JSON. No markdown code blocks, no extra text.`

      console.log('Sending request to Gemini...')
      const result = await model.generateContent(feedbackPrompt)
      const responseText = result.response.text()

      console.log('Raw Gemini response:', responseText)

      // Clean up the response - remove markdown code blocks if present
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      console.log('Cleaned response:', cleanedResponse)

      const feedbackData = JSON.parse(cleanedResponse)
      console.log('Parsed feedback data:', feedbackData)

      return feedbackData
    } catch (err) {
      console.error('Error getting feedback from Gemini:', err)
      toast.error('Failed to get feedback from AI')
      return null
    }
  }

  const SaveUserAnswer = async () => {
    console.log('SaveUserAnswer called, isRecording:', isRecording, 'userAnswer length:', userAnswer?.length)

    // Start recording
    if (!isRecording && !userAnswer) {
      console.log('Starting speech recording...')
      startSpeechToText()
      return
    }

    // Stop recording
    if (isRecording) {
      console.log('Stopping speech recording...')
      stopSpeechToText()
      return
    }

    // Validate answer length
    if (!userAnswer || userAnswer.trim().length < 10) {
      console.warn('Answer too short:', userAnswer?.length)
      toast.error('Error while saving your answer, Please record again')
      return
    }

    // Get current question - with safety checks
    console.log('Getting question at index:', activeQuestionIndex)
    console.log('Available questions:', interviewQuestions)

    if (!interviewQuestions || interviewQuestions.length === 0) {
      console.error('No interview questions available')
      toast.error('No interview questions loaded')
      return
    }

    const currentQuestion = interviewQuestions[activeQuestionIndex]?.question
    
    if (!currentQuestion) {
      console.error('No question found at index:', activeQuestionIndex)
      toast.error('No question available at current index')
      return
    }

    console.log('Current Question:', currentQuestion)
    console.log('User Answer:', userAnswer)

    // Get feedback from Gemini AI
    setIsProcessing(true)
    try {
      const feedbackResult = await getFeedbackFromGemini(currentQuestion, userAnswer)

      if (feedbackResult) {
        // Log to console
        console.log('╔════════════════════════════════════════╗')
        console.log('║     INTERVIEW FEEDBACK RESULT          ║')
        console.log('╠════════════════════════════════════════╣')
        console.log('  Question:', currentQuestion)
        console.log('  User Answer:', userAnswer)
        console.log('  Rating:', feedbackResult.rating)
        console.log('  Feedback:', feedbackResult.feedback)
        if (feedbackResult.strengths) {
          console.log('  Strengths:', feedbackResult.strengths)
        }
        console.log('╚════════════════════════════════════════╝')

        toast.success('Feedback generated successfully!')
      }
    } catch (err) {
      console.error('Error processing answer:', err)
      toast.error('Failed to process answer')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearAnswer = () => {
    console.log('Clearing answer')
    setUserAnswer('')
  }

  return (
    <div className='flex flex-col items-center'>
      <Button
        variant='outline'
        size='sm'
        className='my-10'
        onClick={SaveUserAnswer}
        disabled={isProcessing}
      >
        {isRecording ? (
          <div className='flex items-center gap-2'>
            <span>🎤 Recording...</span>
          </div>
        ) : isProcessing ? (
          <div className='flex items-center gap-2'>
            <span>⏳ Processing...</span>
          </div>
        ) : (
          'Record Answer'
        )}
      </Button>

      {error && (
        <div className='text-red-500 text-sm mb-4'>
          Error: {error}
        </div>
      )}

      {interimResult && (
        <p className='text-sm text-gray-500 italic'>{interimResult}</p>
      )}

      {userAnswer && (
        <Button onClick={handleClearAnswer} disabled={isRecording || isProcessing}>
          Clear Answer
        </Button>
      )}
    </div>
  )
}

export default SpeechRecognition
