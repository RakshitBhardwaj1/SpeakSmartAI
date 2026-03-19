"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Briefcase, 
  ExternalLink, 
  Trash2, 
  ClipboardCheck, 
  PlayCircle,
  Code2,
  Clock
} from "lucide-react";

function InterviewItemCard({ interview, onDelete = () => {} }) {
  const hasResume = Boolean(interview?.resumeUrl);
  const mockId = interview?.mockId;

  if (!mockId) return null;

  const createdAt = interview?.createdAt
    ? new Date(interview.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : "N/A";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      
      {/* Top Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
            {hasResume
              ? "Resume-Based Analysis"
              : interview?.jobPosition || "Custom Interview"}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            <Calendar className="h-3 w-3" />
            {createdAt}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
          hasResume 
          ? "bg-slate-100 text-slate-700 ring-slate-300" 
          : "bg-slate-100 text-slate-700 ring-slate-300"
        }`}>
          {hasResume ? "AI Resume" : "Job Role"}
        </span>
      </div>

      {/* Content Section */}
      <div className="mt-6 min-h-[100px] space-y-3">
        {!hasResume ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Code2 className="h-4 w-4 text-slate-400" />
              <span className="line-clamp-1 font-medium">{interview?.skills || "General Skills"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{interview?.jobExperience || "0"} Years Experience</span>
            </div>
            <div className="mt-2 line-clamp-2 text-xs italic text-slate-500">
              "{interview?.jobDescription || "No description provided."}"
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <a
              href={interview.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="group/link flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium underline-offset-4 group-hover/link:underline">View Uploaded Resume</span>
            </a>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ClipboardCheck className="h-4 w-4 text-slate-500" />
              <span className="font-medium capitalize">{interview?.status || "Ready"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href={`/dashboard/interview/${mockId}/start`}>
          <Button className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <PlayCircle className="h-4 w-4" />
            Start
          </Button>
        </Link>

        <Link href={`/dashboard/interview/${mockId}/feedback`}>
          <Button variant="outline" className="w-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
            <ClipboardCheck className="h-4 w-4" />
            Feedback
          </Button>
        </Link>
      </div>

      {/* Delete Action - Subtle but accessible */}
      <button
        onClick={() => onDelete(interview)}
        className="absolute bottom-20 right-6 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
        title="Delete Interview"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default InterviewItemCard;