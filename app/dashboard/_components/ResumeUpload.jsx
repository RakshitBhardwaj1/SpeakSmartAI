
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
      className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200
      dark:border-neutral-800 rounded-2xl"
    >
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}

export default ResumeUpload;