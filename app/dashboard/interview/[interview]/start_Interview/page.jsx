"use client";

import React, { useEffect, useState } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";

function Start_Interview_Actual({ params }) {
  const { interview: interviewId } = React.use(params);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  useEffect(() => {
    const getInterviewDetails = async () => {
      try {
        const response = await fetch(`/api/interviews/${encodeURIComponent(interviewId)}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch interview details");
        }

        const json = await response.json();
        const result = json?.interview ? [json.interview] : [];

        if (!result || result.length === 0) {
          console.log("Interview details not found.");
          return;
        }

        const data = result[0];

        // Support both { questions: [...] } and direct array JSON payloads.
        let parsedQuestions = [];
        try {
          const rawQuestions = data?.interviewQuestions;
          const parsed = rawQuestions ? JSON.parse(rawQuestions) : [];
          parsedQuestions = Array.isArray(parsed) ? parsed : parsed?.questions || [];
        } catch {
          parsedQuestions = [];
        }

        console.log("Interview details:", data);
        console.log("Interview questions:", parsedQuestions);
        setInterviewQuestions(parsedQuestions);
        if (!parsedQuestions.length) {
          console.log("Raw interviewQuestions value:", data?.interviewQuestions);
        }
      } catch (fetchError) {
        console.error("Error fetching interview details:", fetchError);
      }
    };

    if (interviewId) {
      getInterviewDetails();
    }
  }, [interviewId]);


  return (
      <div className='px-2 py-3 md:px-4'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Questions */}
            <QuestionsSection 
              interviewQuestions={interviewQuestions} 
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={setActiveQuestionIndex}
            />
            {/* Record Answer */}
            <RecordAnswerSection
              interviewQuestions={interviewQuestions} 
              activeQuestionIndex={activeQuestionIndex}
              onQuestionChange={setActiveQuestionIndex}
              mockId={interviewId}
            />
        </div>
        
      </div>
  
    );
}

export default Start_Interview_Actual;
