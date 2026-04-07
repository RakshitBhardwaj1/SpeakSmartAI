"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { UserAnswerTable, InterviewSessionTable } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronDown, Star, Home } from "lucide-react";

function Feedback({ params }) {
  const { interview: interviewId } = React.use(params);
  const { user } = useUser();
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const completionMarkedRef = React.useRef(false);

  useEffect(() => {
    if (interviewId) {
      fetchFeedback();
      fetchSessionQuestions();
    }
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

  const fetchSessionQuestions = async () => {
    try {
      const result = await db
        .select()
        .from(InterviewSessionTable)
        .where(eq(InterviewSessionTable.mockId, interviewId));
      if (result && result.length > 0) {
        const raw = result[0]?.interviewQuestions;
        const parsed = raw ? JSON.parse(raw) : [];
        const questions = Array.isArray(parsed) ? parsed : parsed?.questions || [];
        setSessionQuestions(questions);
      }
    } catch (err) {
      console.error("Error fetching session questions:", err);
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

  const formatFeedbackText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let formattedLine = line;
      let isHeading = false;
      if (formattedLine.startsWith('### ')) {
        formattedLine = formattedLine.replace('### ', '');
        isHeading = true;
      }
      // Very simple bold Markdown parsing
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      
      return (
        <span key={i} className={isHeading ? "font-bold block mt-3 mb-1 text-slate-800" : (formattedLine.trim() === "" ? "block h-1" : "block mb-1")}>
          {parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  useEffect(() => {
    if (completionMarkedRef.current) return;
    if (!feedbackList.length) return;

    const hasAnsweredAtLeastOne = feedbackList.some(
      (item) => item?.useranswer && item.useranswer !== "N/A",
    );

    if (!hasAnsweredAtLeastOne) return;

    const markCompletion = async () => {
      try {
        const response = await fetch("/api/interview-streak/complete", {
          method: "POST",
          cache: "no-store",
        });

        if (response.ok) {
          completionMarkedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to mark interview streak completion:", error);
      }
    };

    markCompletion();
  }, [feedbackList]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-slate-500 animate-pulse">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      {/* Header */}
      <div className="premium-card mb-8 p-6 text-center">
        <h2 className="mb-2 text-4xl font-extrabold text-gradient-brand">Congratulations!</h2>
        <p className="text-lg text-slate-600">You have completed the interview.</p>
      </div>

      {/* Overall Rating Card */}
      {overallRating && (
        <div className="premium-card mb-8 p-6 text-center">
          <h3 className="mb-1 text-xl font-semibold text-slate-700">Overall Performance Rating</h3>
          <p className="mb-3 text-sm text-slate-400">Based on all your answers combined</p>
          <div className="flex items-center justify-center gap-2">
            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            <span className={`text-5xl font-bold ${getRatingColor(parseFloat(overallRating))}`}>
              {overallRating}
            </span>
            <span className="mb-1 self-end text-2xl text-slate-400">/ 10</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {feedbackList.length} question{feedbackList.length !== 1 ? "s" : ""} answered
          </p>
        </div>
      )}

      {/* Per-question Feedback */}
      <h3 className="mb-4 text-2xl font-bold text-slate-800">Answer-wise Feedback</h3>
      <p className="mb-6 text-sm text-slate-500">Click on a question to expand and view detailed feedback.</p>

      {feedbackList.length === 0 ? (
        sessionQuestions.length > 0 ? (
          <div className="space-y-3">
            {sessionQuestions.map((item, index) => (
              <Collapsible
                key={index}
                open={openIndex === index}
                onOpenChange={(open) => setOpenIndex(open ? index : null)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={`w-full text-left flex items-center justify-between rounded-xl border-2 p-4 font-medium transition-all hover:shadow-md ${
                      openIndex === index ? "border-teal-300 bg-teal-50/50" : "border-slate-200 bg-white/85 hover:border-teal-300"
                    }`}
                  >
                    <span className="flex items-center gap-3 pr-4">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-snug text-slate-800">{item.question}</span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-1 space-y-4 rounded-xl border-2 border-t-0 border-slate-100 bg-slate-50 p-5 text-sm">
                    {/* Your Answer — skipped */}
                    <div>
                      <p className="mb-1 font-semibold text-slate-600">Your Answer</p>
                      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-center font-bold tracking-wide text-red-500">
                        NO ANSWER RECORDED
                      </p>
                    </div>

                    {/* Model Answer */}
                    {item.answer && (
                      <div>
                        <p className="mb-1 font-semibold text-green-600">Model Answer</p>
                        <p className="rounded-lg border border-green-200 bg-green-50 p-3 leading-relaxed text-slate-700">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p>No feedback found for this interview.</p>
          </div>
        )
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
                  className={`w-full text-left flex items-center justify-between rounded-xl border-2 p-4 font-medium transition-all hover:shadow-md ${
                    openIndex === index ? "border-teal-300 bg-teal-50/50" : "border-slate-200 bg-white/85 hover:border-teal-300"
                  }`}
                >
                  <span className="flex items-center gap-3 pr-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-snug text-slate-800">{item.question}</span>
                  </span>
                  <span className="flex items-center gap-3 flex-shrink-0">
                    {item.rating != null && (
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getRatingBg(item.rating)} ${getRatingColor(item.rating)}`}>
                        {item.rating}/10
                      </span>
                    )}
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-1 space-y-4 rounded-xl border-2 border-t-0 border-slate-100 bg-slate-50 p-5 text-sm">
                  {/* Your Answer */}
                  <div>
                    <p className="mb-1 font-semibold text-slate-600">Your Answer</p>
                    {item.useranswer ? (
                      <p className="rounded-lg border border-slate-200 bg-white p-3 leading-relaxed text-slate-700">
                        {item.useranswer}
                      </p>
                    ) : (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-center font-bold tracking-wide text-red-500">
                        NO ANSWER RECORDED
                      </p>
                    )}
                  </div>

                  {/* Correct / Model Answer */}
                  {item.correctanswer && item.correctanswer !== "N/A" && (
                    <div>
                      <p className="mb-1 font-semibold text-green-600">Model Answer</p>
                      <p className="rounded-lg border border-green-200 bg-green-50 p-3 leading-relaxed text-slate-700">
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
                            <p className="mb-1 font-semibold text-blue-600">AI Feedback</p>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 leading-relaxed text-slate-700">
                              {formatFeedbackText(parsed.feedback)}
                            </div>
                          </div>
                        )}
                        {parsed.strengths && (
                          <div>
                            <p className="mb-1 font-semibold text-purple-600">Strengths</p>
                            <p className="rounded-lg border border-purple-200 bg-purple-50 p-3 leading-relaxed text-slate-700">
                              {parsed.strengths}
                            </p>
                          </div>
                        )}
                        {parsed.speechFeedback && (
                          <div>
                            <p className="mb-1 font-semibold text-orange-600">Speech & Tone Analysis</p>
                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 leading-relaxed text-slate-700">
                              {formatFeedbackText(parsed.speechFeedback)}
                            </div>
                          </div>
                        )}
                        {parsed.speechMetrics && (
                          <div>
                            <p className="mb-1 font-semibold text-teal-600">Speech Performance Metrics</p>
                            <p className="rounded-lg border border-teal-200 bg-teal-50 p-3 leading-relaxed text-slate-700">
                              {parsed.speechMetrics}
                            </p>
                          </div>
                        )}
                        {parsed.detailedAnalysis?.graphs && (
                          <div className="mt-6">
                            <p className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                              <span className="text-xl">📈</span> Analysis Graphs
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {Object.entries(parsed.detailedAnalysis.graphs).map(([name, base64], i) => (
                                <div key={i} className="group overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-all hover:shadow-md">
                                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-50">
                                    <img 
                                      src={`data:image/png;base64,${base64}`} 
                                      alt={name}
                                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                                  </div>
                                  <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {name.replace(/_/g, ' ')}
                                  </p>
                                </div>
                              ))}
                            </div>
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
          className="cta-shine flex items-center gap-2 bg-gradient-to-r from-teal-600 to-orange-500 px-8 py-3 text-base text-white hover:from-teal-700 hover:to-orange-600"
        >
          <Home className="w-5 h-5" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default Feedback;
