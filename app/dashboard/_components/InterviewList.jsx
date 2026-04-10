"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import InterviewItemCard from "./InterviewItemCard";

function InterviewList() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [interviewList, setInterviewList] = useState([]);

  const buildAuthHeaders = async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (user?.id) {
      getInterviewList();
    }
  }, [user?.id]);

  const getInterviewList = async () => {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch("/api/interviews", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers,
      });

      if (response.status === 401) {
        setInterviewList([]);
        console.warn("Interview API returned 401. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch interviews (${response.status})`);
      }

      const data = await response.json();
      setInterviewList(data?.interviews || []);
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
      const headers = await buildAuthHeaders();
      const response = await fetch(`/api/interviews/${encodeURIComponent(interview.mockId)}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });

      if (response.status === 401) {
        alert("Your session expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to delete interview (${response.status})`);
      }

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
      <div className='mt-10 flex items-end justify-between gap-3'>
        <h1 className="text-xl font-bold text-slate-900">Interview Sessions</h1>
        <p className='text-xs uppercase tracking-[0.16em] text-slate-500'>Recent Activity</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {interviewList.length > 0 ? (
          interviewList.map((interview, index) => (
            <InterviewItemCard
              key={interview.id ?? index}
              interview={interview}
              onDelete={handleDeleteInterview}
            />
          ))
        ) : (
          <div className='col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center'>
            <p className="text-sm text-slate-500">No interview sessions found. Create a new session to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewList;
