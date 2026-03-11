"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import { InterviewSessionTable, SpeakSmartAI, UserAnswerTable } from "@/utils/schema";
import { and, desc, eq } from "drizzle-orm";
import InterviewItemCard from "./InterviewItemCard";

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    if (user?.id) {
      getInterviewList();
    }
  }, [user?.id]);

  const getInterviewList = async () => {
    try {
      const result = await db
        .select()
        .from(InterviewSessionTable)
        .where(eq(InterviewSessionTable.userId, user.id))
        .orderBy(desc(InterviewSessionTable.createdAt));

      setInterviewList(result || []);
    } catch (error) {
      console.error("Failed to load interview list:", error);
      setInterviewList([]);
    }
  };

  const handleDeleteInterview = async (interview) => {
    if (!interview?.mockId || !user?.id) return;

    const isConfirmed = window.confirm(
      "Delete this interview? This will remove interview details, answers, and feedback permanently."
    );

    if (!isConfirmed) return;

    try {
      await db
        .delete(UserAnswerTable)
        .where(eq(UserAnswerTable.mockId, interview.mockId));

      await db
        .delete(SpeakSmartAI)
        .where(eq(SpeakSmartAI.mockId, interview.mockId));

      await db
        .delete(InterviewSessionTable)
        .where(
          and(
            eq(InterviewSessionTable.mockId, interview.mockId),
            eq(InterviewSessionTable.userId, user.id)
          )
        );

      setInterviewList((prev) =>
        prev.filter((item) => item.mockId !== interview.mockId)
      );
    } catch (error) {
      console.error("Failed to delete interview:", error);
      alert("Failed to delete interview. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="font-bold text-lg mt-4">Previous Interview List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {interviewList.length > 0 ? (
          interviewList.map((interview, index) => (
            <InterviewItemCard
              key={interview.id ?? index}
              interview={interview}
              onDelete={handleDeleteInterview}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No previous interviews found.</p>
        )}
      </div>
    </div>
  );
}

export default InterviewList;
