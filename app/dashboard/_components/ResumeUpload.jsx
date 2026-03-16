
"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

function ResumeUpload({ setResumeFile }) {
  const [files, setFiles] = useState([]);

  const handleFileUpload = (uploadedFiles) => {
    const safeFiles = Array.isArray(uploadedFiles) ? uploadedFiles : [];
    setFiles(safeFiles);

    // send first file to parent (AddNewInterview)
    setResumeFile(safeFiles.length > 0 ? safeFiles[0] : null);
  };

  return (
    <div
      className="mx-auto min-h-96 w-full max-w-4xl rounded-2xl border border-dashed border-teal-300/70 bg-gradient-to-br from-white to-teal-50/40"
    >
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}

export default ResumeUpload;