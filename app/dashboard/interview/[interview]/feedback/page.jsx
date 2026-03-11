"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { UserAnswerTable } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronDown, Star, Home } from "lucide-react";

function Feedback({ params }) {
  const { interview: interviewId } = React.use(params);
  const { user } = useUser();
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (interviewId) fetchFeedback();
  }, [interviewId, user]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(UserAnswerTable)
        .where(eq(UserAnswerTable.mockId, interviewId));
      setFeedbackList(result);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const overallRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((sum, item) => sum + (item.rating || 0), 0) /
          feedbackList.length
        ).toFixed(1)
      : null;

  const getRatingColor = (rating) => {
    if (rating >= 8) return "text-green-600";
    if (rating >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  const getRatingBg = (rating) => {
    if (rating >= 8) return "bg-green-50 border-green-200";
    if (rating >= 5) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const parseFeedback = (feedbackStr) => {
    if (!feedbackStr) return null;
    try {
      return JSON.parse(feedbackStr);
    } catch {
      return { feedback: feedbackStr };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-lg animate-pulse">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-green-500 mb-2">Congratulations!</h2>
        <p className="text-gray-600 text-lg">You have completed the interview.</p>
      </div>

      {/* Overall Rating Card */}
      {overallRating && (
        <div className="bg-white border-2 border-primary/30 rounded-2xl p-6 mb-8 shadow-sm text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-1">Overall Performance Rating</h3>
          <p className="text-gray-400 text-sm mb-3">Based on all your answers combined</p>
          <div className="flex items-center justify-center gap-2">
            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            <span className={`text-5xl font-bold ${getRatingColor(parseFloat(overallRating))}`}>
              {overallRating}
            </span>
            <span className="text-2xl text-gray-400 self-end mb-1">/ 10</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {feedbackList.length} question{feedbackList.length !== 1 ? "s" : ""} answered
          </p>
        </div>
      )}

      {/* Per-question Feedback */}
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Answer-wise Feedback</h3>
      <p className="text-gray-500 text-sm mb-6">Click on a question to expand and view detailed feedback.</p>

      {feedbackList.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No feedback found for this interview.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbackList.map((item, index) => (
            <Collapsible
              key={item.id ?? index}
              open={openIndex === index}
              onOpenChange={(open) => setOpenIndex(open ? index : null)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={`w-full text-left flex items-center justify-between p-4 rounded-xl border-2 font-medium transition-all hover:shadow-md ${
                    openIndex === index ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-3 pr-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-800 text-sm leading-snug">{item.question}</span>
                  </span>
                  <span className="flex items-center gap-3 flex-shrink-0">
                    {item.rating != null && (
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getRatingBg(item.rating)} ${getRatingColor(item.rating)}`}>
                        {item.rating}/10
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-1 rounded-xl border-2 border-t-0 border-gray-100 bg-gray-50 p-5 space-y-4 text-sm">
                  {/* Your Answer */}
                  <div>
                    <p className="font-semibold text-gray-600 mb-1">Your Answer</p>
                    <p className="text-gray-700 bg-white rounded-lg p-3 border border-gray-200 leading-relaxed">
                      {item.useranswer || <span className="text-gray-400 italic">No answer recorded.</span>}
                    </p>
                  </div>

                  {/* Correct / Model Answer */}
                  {item.correctanswer && item.correctanswer !== "N/A" && (
                    <div>
                      <p className="font-semibold text-green-600 mb-1">Model Answer</p>
                      <p className="text-gray-700 bg-green-50 rounded-lg p-3 border border-green-200 leading-relaxed">
                        {item.correctanswer}
                      </p>
                    </div>
                  )}

                  {/* AI Feedback */}
                  {(() => {
                    const parsed = parseFeedback(item.feedback);
                    if (!parsed) return null;
                    return (
                      <>
                        {parsed.feedback && (
                          <div>
                            <p className="font-semibold text-blue-600 mb-1">AI Feedback</p>
                            <p className="text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-200 leading-relaxed">
                              {parsed.feedback}
                            </p>
                          </div>
                        )}
                        {parsed.strengths && (
                          <div>
                            <p className="font-semibold text-purple-600 mb-1">Strengths</p>
                            <p className="text-gray-700 bg-purple-50 rounded-lg p-3 border border-purple-200 leading-relaxed">
                              {parsed.strengths}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Go to Dashboard */}
      <div className="mt-10 flex justify-center">
        <Button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-8 py-3 text-base"
        >
          <Home className="w-5 h-5" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default Feedback;
