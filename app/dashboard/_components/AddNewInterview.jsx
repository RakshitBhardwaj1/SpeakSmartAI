
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import ResumeUpload from "./ResumeUpload";
import axios from "axios";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [jobPosition, setJobPosition] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [skills, setSkills] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const onSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();

    // Validate: either resume OR job details must be provided
    if (!resumeFile && (!jobPosition && !jobDescription && !skills && !experience)) {
      alert("Please upload a resume file OR fill in job details (position, description, skills, experience).");
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    
    formData.append("files", resumeFile || '');
    formData.append("jobPosition", jobPosition);
    formData.append("jobDescription", jobDescription);
    formData.append("skills", skills);
    formData.append("experience", experience);

    try {
      const response = await axios.post("/api/generate-interview-questions", formData);
      
      console.log("✅ Request submitted successfully!");
      console.log("API Response:", response.data);
      console.log("Interview Questions:", response.data?.questions || []);

      if(response?.data?.status===429) {
        alert(" Too Many Requests & No Free Credit Remaining Try Again after 24 hour");
        return;
      }

      if (!response?.data?.questionsCount) {
        console.warn("No interview questions were extracted from the provided input.");
      }

      alert(
        `✅ Success!\nQuestions Generated: ${response?.data?.questionsCount || 0}\nSource: ${response?.data?.source || "Processing..."}`
      );
      const createdMockId = response?.data?.mockId;

      if (createdMockId) {
        setOpenDialog(false);
        setResumeFile(null);
        setJobPosition("");
        setJobDescription("");
        setSkills("");
        setExperience("");
        router.push(`/dashboard/interview/${createdMockId}`);
        return;
      }

      setOpenDialog(false);
      setResumeFile(null);
      setJobPosition("");
      setJobDescription("");
      setSkills("");
      setExperience("");
    } catch (error) {
      console.error("Error submitting request:", error);
      const serverError = error?.response?.data;
      alert(
        `❌ Failed to process request.\n${serverError?.error || "Unknown error"}\n${serverError?.details || "Please check your connection and try again."}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200 transform hover:scale-105"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="min-h-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Please submit following details.
            </DialogTitle>
            <DialogDescription>
              Upload resume and optionally add job details.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="resume-upload" className="w-full mt-3">
            <TabsList>
              <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
              <TabsTrigger value="job-description">Job Description</TabsTrigger>
            </TabsList>

            <TabsContent value="resume-upload">
              <ResumeUpload setResumeFile={setResumeFile} />
            </TabsContent>

            <TabsContent value="job-description">
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add details about role, skills and experience</h2>

                  <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                    <label>Job Position/Role:</label>
                    <Input
                      placeholder="Ex. Software Engineer, Full Stack Developer"
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                    <label>Job Description:</label>
                    <Textarea
                      placeholder="Describe the job position and responsibilities..."
                      value={jobDescription}
                      onChange={(event) => setJobDescription(event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                    <label>Skills:</label>
                    <Input
                      placeholder="Ex. JavaScript, React, Node.js"
                      value={skills}
                      onChange={(event) => setSkills(event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                    <label>Year of Experience:</label>
                    <Input
                      placeholder="Ex. 2"
                      type="number"
                      min="0"
                      max="50"
                      value={experience}
                      onChange={(event) => setExperience(event.target.value)}
                    />
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-5 justify-end">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>

            <Button onClick={onSubmit} disabled={isProcessing || (!resumeFile && !jobPosition && !jobDescription && !skills && !experience)}>
                {isProcessing ? "Submitting..." : "Submit"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;