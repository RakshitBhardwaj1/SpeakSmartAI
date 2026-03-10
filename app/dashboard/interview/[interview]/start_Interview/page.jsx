"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { InterviewSessionTable } from "@/utils/schema";
import { eq } from "drizzle-orm";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";

function Start_Interview_Actual({ params }) {
  const { interview: interviewId } = React.use(params);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  useEffect(() => {
    const getInterviewDetails = async () => {
      try {
        const result = await db
          .select()
          .from(InterviewSessionTable)
          .where(eq(InterviewSessionTable.mockId, interviewId));

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
      <div>
        <div className='grid grid-cols-1 md:grid-cols-2'>
            {/* Questions */}
            <QuestionsSection 
              interviewQuestions={interviewQuestions} 
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={setActiveQuestionIndex}
            />
            {/* Record Answer */}
            <RecordAnswerSection/>
        </div>
        
      </div>
  
    );
}

export default Start_Interview_Actual;
