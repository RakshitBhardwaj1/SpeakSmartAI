import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function InterviewItemCard({ interview, onDelete = () => {} }) {
  const hasResume = Boolean(interview?.resumeUrl);
  const mockId = interview?.mockId;

  if (!mockId) return null;

  const createdAt = interview?.createdAt
    ? new Date(interview.createdAt).toLocaleString()
    : "N/A";

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {hasResume
            ? "Resume-Based Interview"
            : interview?.jobPosition || "Job Interview"}
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {hasResume ? "Resume Upload" : "Job Details"}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Created: {createdAt}
      </p>

      {!hasResume ? (
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Position:</span>{" "}
            {interview?.jobPosition || "N/A"}
          </p>
          <p>
            <span className="font-medium">Skills:</span>{" "}
            {interview?.skills || "N/A"}
          </p>
          <p>
            <span className="font-medium">Experience:</span>{" "}
            {interview?.jobExperience || "N/A"}
          </p>
          <p className="line-clamp-3">
            <span className="font-medium">Description:</span>{" "}
            {interview?.jobDescription || "N/A"}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Resume:</span>{" "}
            <a
              href={interview.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Resume
            </a>
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {interview?.status || "completed"}
          </p>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Link href={`/dashboard/interview/${mockId}/start`} className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Start Interview
          </Button>
        </Link>

        <Link href={`/dashboard/interview/${mockId}/feedback`} className="flex-1">
          <Button variant="outline" className="w-full">
            Feedback
          </Button>
        </Link>
      </div>

      <div className="mt-3">
        <Button
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete(interview)}
        >
          Delete Interview
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
