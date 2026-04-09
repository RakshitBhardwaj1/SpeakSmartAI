'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import useSpeechToText from 'react-hook-speech-to-text'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from '@/utils/db'
import { UserAnswerTable } from '@/utils/schema'
import { useAuth, useUser } from '@clerk/nextjs'
import { StopCircle } from 'lucide-react'
import { and, eq } from 'drizzle-orm'
import { useRouter } from 'next/navigation'

function SpeechRecognition({ interviewQuestions = [], activeQuestionIndex = 0, onNext = () => {}, mockId: propMockId = '', onQuestionChange = () => {} }) {
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
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const lastSyncedAnswerRef = useRef('')
  const prevRecordingRef = useRef(false)
  const isFinalizingRef = useRef(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioBlobRef = useRef(null)

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

      const feedbackPrompt = `You are an expert interview coach. Analyze the following interview answer and provide constructive feedback.

    Question: ${question}

    User Answer: ${answer}

    Please provide your response in the following JSON format ONLY (no additional text, no markdown):
    {
      "rating": <number between 1-10>,
      "feedback": "<3-5 line constructive feedback highlighting areas of improvement>",
      "strengths": "<mention 1-2 key strengths of the answer>",
      "modelAnswer": "<a concise ideal model answer to the question, 2-4 sentences>"
    }

    Important: Respond ONLY with valid JSON. No markdown code blocks, no extra text.`

      const preferredModel = process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim()
      const discoveredModels = []

      // Discover models enabled for this API key to avoid hardcoded 404s.
      try {
        const listModelsResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        )

        if (listModelsResp.ok) {
          const listModelsJson = await listModelsResp.json()
          const models = listModelsJson?.models || []

          models.forEach((m) => {
            const supportsGenerate = (m?.supportedGenerationMethods || []).includes('generateContent')
            if (!supportsGenerate || !m?.name) return
            discoveredModels.push(m.name.replace('models/', ''))
          })
        } else {
          console.warn('ListModels request failed with status:', listModelsResp.status)
        }
      } catch (listErr) {
        console.warn('Could not discover models via ListModels:', listErr)
      }

      const modelNames = [
        preferredModel,
        ...discoveredModels,
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
      ].filter(Boolean)

      const uniqueModelNames = [...new Set(modelNames)]
      let responseText = ''

      for (const modelName of uniqueModelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          console.log(`Sending request to Gemini model: ${modelName}`)
          const result = await model.generateContent(feedbackPrompt)
          responseText = result.response.text()
          break
        } catch (modelErr) {
          console.warn(`Model ${modelName} failed:`, modelErr)
        }
      }

      if (!responseText) {
        throw new Error('No supported Gemini model responded successfully')
      }

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

  const getCurrentQuestionContext = () => {
    if (!interviewQuestions?.length) return null

    const questionObj = interviewQuestions[activeQuestionIndex]
    const question = questionObj?.question
    if (!question) return null

    return {
      question,
      correctAnswer: questionObj?.answer || 'N/A',
      mockId: propMockId || localStorage.getItem('mockId') || 'mock_unknown',
      userEmail: user?.primaryEmailAddress?.emailAddress || localStorage.getItem('userEmail') || 'unknown@example.com',
    }
  }

  const upsertAnswer = async ({ answerText, feedbackResult = null }) => {
    const context = getCurrentQuestionContext()
    if (!context) return

    const { question, correctAnswer, mockId, userEmail } = context

    const existing = await db
      .select({ id: UserAnswerTable.id })
      .from(UserAnswerTable)
      .where(
        and(
          eq(UserAnswerTable.mockId, mockId),
          eq(UserAnswerTable.question, question),
          eq(UserAnswerTable.userEmail, userEmail)
        )
      )
      .limit(1)

    const basePayload = {
      useranswer: answerText,
      correctanswer: correctAnswer,
    }

    if (feedbackResult) {
      basePayload.feedback = JSON.stringify(feedbackResult)
      basePayload.rating = Number(feedbackResult?.rating) || null
      if (feedbackResult.modelAnswer) {
        basePayload.correctanswer = feedbackResult.modelAnswer
      }
    }

    if (existing.length > 0) {
      await db
        .update(UserAnswerTable)
        .set(basePayload)
        .where(eq(UserAnswerTable.id, existing[0].id))
    } else {
      await db.insert(UserAnswerTable).values({
        mockId,
        question,
        correctanswer: correctAnswer,
        useranswer: interviewQuestions[activeQuestionIndex]?.answer || 'N/A',
        feedback: feedbackResult ? JSON.stringify(feedbackResult) : null,
        rating: feedbackResult ? Number(feedbackResult?.rating) || null : null,
        userEmail,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const finalizeCurrentAnswer = async () => {
    const finalAnswer = userAnswer?.trim()
    if (!finalAnswer || finalAnswer.length < 2) return
    if (isFinalizingRef.current) return

    const context = getCurrentQuestionContext()
    if (!context) return

    isFinalizingRef.current = true
    setIsProcessing(true)

    try {
      let feedbackResult = null

      if (finalAnswer.length >= 10) {
        // 1. Get textual answer feedback from Gemini
        const geminiResult = await getFeedbackFromGemini(context.question, finalAnswer)
        
        // 2. Process audio via speech-analysis-api
        let audioBlob = null;
        for (let i = 0; i < 20; i++) {
          if (audioBlobRef.current) {
            audioBlob = audioBlobRef.current;
            break;
          }
          await new Promise(r => setTimeout(r, 50));
        }

        let speechResult = null;
        if (audioBlob) {
          try {
            const token = await getToken();
            if (!token) {
              toast.error('Authentication required. Please sign in again.');
              return;
            }

            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            console.log("Sending audio to Python speech-analysis-api...");
            const response = await fetch('http://localhost:8000/api/v1/analyze', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData
            });
            if (response.ok) {
              const apiResult = await response.json();
              speechResult = apiResult.data;
              console.log("Python API analysis successful");
            } else {
              const errorText = await response.text();
              console.warn('Speech analysis API error: ' + errorText);
            }
          } catch (e) {
             console.warn("Speech analysis API error:", e);
          }
        }

        // 3. Combine Gemini textual evaluation with Speech Analysis
        if (geminiResult) {
          feedbackResult = {
            rating: geminiResult.rating,
            feedback: geminiResult.feedback,
            strengths: geminiResult.strengths || '',
            modelAnswer: geminiResult.modelAnswer
          };

          if (speechResult) {
             feedbackResult.speechFeedback = speechResult.feedback || "Audio analyzed successfully.";
             feedbackResult.speechMetrics = `Prosody Score: ${speechResult.report_card?.overall_score || 0}/100. Pacing: ${speechResult.report_card?.pacing?.score}. Tone/Expressiveness: ${speechResult.report_card?.expressiveness?.score}`;
             feedbackResult.detailedAnalysis = speechResult;
          }
        } else if (speechResult) {
           feedbackResult = {
             rating: 0,
             feedback: "Could not evaluate textual answer. Speech Analysis: " + (speechResult.feedback || "Audio analyzed successfully."),
             strengths: `Prosody Score: ${speechResult.report_card?.overall_score || 0}/100`,
             modelAnswer: context.correctAnswer,
             detailedAnalysis: speechResult
           };
        }
      }

      await upsertAnswer({ answerText: finalAnswer, feedbackResult })

      if (feedbackResult) {
        console.log('╔════════════════════════════════════════╗')
        console.log('║     INTERVIEW FEEDBACK RESULT          ║')
        console.log('╠════════════════════════════════════════╣')
        console.log('  Question:', context.question)
        console.log('  User Answer:', finalAnswer)
        console.log('  Rating:', feedbackResult.rating)
        console.log('  Feedback:', feedbackResult.feedback)
        if (feedbackResult.strengths) {
          console.log('  Strengths:', feedbackResult.strengths)
        }
        console.log('╚════════════════════════════════════════╝')
      }
    } catch (err) {
      console.error('Error while finalizing answer:', err)
      toast.error('Failed to finalize answer')
    } finally {
      setIsProcessing(false)
      isFinalizingRef.current = false
    }
  }

  const handleRecordToggle = async () => {
    if (!isRecording) {
      startSpeechToText()
      audioBlobRef.current = null
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        }

        mediaRecorder.start()
      } catch (err) {
        console.error("Error accessing mic for audio recording:", err)
      }
      return
    }
    stopSpeechToText()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleNextQuestion = async () => {
    if (isRecording) {
      stopSpeechToText()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    await finalizeCurrentAnswer()

    if (activeQuestionIndex >= interviewQuestions.length - 1) {
      toast.info('You are already on the last question')
      return
    }

    setUserAnswer('')
    lastSyncedAnswerRef.current = ''
    onNext()
  }

  // Live sync while user is speaking (debounced).
  useEffect(() => {
    if (!isRecording) return

    const currentAnswer = userAnswer?.trim() || ''
    if (!currentAnswer || currentAnswer.length < 2) return
    if (currentAnswer === lastSyncedAnswerRef.current) return

    const timer = setTimeout(async () => {
      try {
        await upsertAnswer({ answerText: currentAnswer })
        lastSyncedAnswerRef.current = currentAnswer
      } catch (err) {
        console.error('Live answer sync failed:', err)
      }
    }, 700)

    return () => clearTimeout(timer)
  }, [userAnswer, isRecording, activeQuestionIndex, interviewQuestions, user])

  // When recording stops, finalize the answer with feedback.
  useEffect(() => {
    if (prevRecordingRef.current && !isRecording) {
      finalizeCurrentAnswer()
    }
    prevRecordingRef.current = isRecording
  }, [isRecording])

  return (
    <div className='flex flex-col items-center gap-4'>
      <Button
        variant='outline'
        size='sm'
        className='my-10'
        onClick={handleRecordToggle}
        disabled={isProcessing}
      >
        {isRecording ? (
          <div className='text-red-500 flex items-center gap-2'>
            <StopCircle/><h2>Stop Recording</h2>
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

      <div className='flex gap-3 flex-wrap justify-center'>
        {activeQuestionIndex > 0 && (
          <Button onClick={() => onQuestionChange(activeQuestionIndex - 1)} disabled={isProcessing} className='bg-blue-600 hover:bg-blue-700 text-white'>
            ← Previous Question
          </Button>
        )}
        <Button onClick={handleNextQuestion} disabled={isProcessing} className='bg-green-600 hover:bg-green-700 text-white'>
          Next Question →
        </Button>
        {activeQuestionIndex === interviewQuestions.length - 1 && (
          <Button
            disabled={isProcessing}
            className='bg-gray-700 hover:bg-gray-800 text-white'
            onClick={async () => {
              if (isRecording) {
                stopSpeechToText()
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop()
                  mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
                }
                await new Promise((resolve) => setTimeout(resolve, 500))
              }
              await finalizeCurrentAnswer()
              router.push(`/dashboard/interview/${propMockId}/feedback`)
            }}
          >
            End Interview
          </Button>
        )}
      </div>
    </div>
  )
}

export default SpeechRecognition
