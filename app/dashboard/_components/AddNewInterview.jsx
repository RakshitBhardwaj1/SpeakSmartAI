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
import { Plus } from "lucide-react";

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
    if (
      !resumeFile &&
      !jobPosition &&
      !jobDescription &&
      !skills &&
      !experience
    ) {
      alert(
        "Please upload a resume file OR fill in job details (position, description, skills, experience).",
      );
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();

    formData.append("files", resumeFile || "");
    formData.append("jobPosition", jobPosition);
    formData.append("jobDescription", jobDescription);
    formData.append("skills", skills);
    formData.append("experience", experience);

    try {
      const response = await axios.post(
        "/api/generate-interview-questions",
        formData,
      );

      console.log("✅ Request submitted successfully!");
      console.log("API Response:", response.data);
      console.log("Interview Questions:", response.data?.questions || []);

      if (response?.data?.status === 429) {
        alert(
          " Too Many Requests & No Free Credit Remaining Try Again after 24 hour",
        );
        return;
      }

      if (!response?.data?.questionsCount) {
        console.warn(
          "No interview questions were extracted from the provided input.",
        );
      }

      alert(
        `✅ Success!\nQuestions Generated: ${response?.data?.questionsCount || 0}\nSource: ${response?.data?.source || "Processing..."}`,
      );
      const createdMockId = response?.data?.mockId;

      if (createdMockId) {
        setOpenDialog(false);
        setResumeFile(null);
        setJobPosition("");
        setJobDescription("");
        setSkills("");
        setExperience("");
        router.push(`/dashboard/interview/${createdMockId}/start`);
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
        `❌ Failed to process request.\n${serverError?.error || "Unknown error"}\n${serverError?.details || "Please check your connection and try again."}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div
        className="group relative flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-all duration-200 hover:border-slate-400 hover:shadow-md md:min-h-[240px]"
        onClick={() => setOpenDialog(true)}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all duration-200 group-hover:bg-slate-800 group-hover:text-white">
          <Plus className="h-8 w-8 transition-transform duration-200 group-hover:rotate-90" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900 transition-colors group-hover:text-slate-900 md:text-3xl">
          Create New Interview
        </h2>
        <p className="mt-2 text-sm text-slate-500 md:text-base">
          Start a new AI-generated session
        </p>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Please submit following details.
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Upload resume and optionally add job details.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="resume-upload" className="w-full mt-3">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100/90">
              <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
              <TabsTrigger value="job-description">Job Description</TabsTrigger>
            </TabsList>

            <TabsContent value="resume-upload">
              <ResumeUpload setResumeFile={setResumeFile} />
            </TabsContent>

            <TabsContent value="job-description">
              <form onSubmit={onSubmit}>
                <div>
                  <h2 className="pt-2 text-sm font-medium text-slate-700">
                    Add details about role, skills and experience
                  </h2>

                  <div className="mx-5 my-5 mt-5 flex flex-col gap-2">
                    <label>Job Position/Role:</label>
                    <Input
                      placeholder="Ex. Software Engineer, Full Stack Developer"
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>

                  <div className="mx-5 my-5 mt-5 flex flex-col gap-2">
                    <label>Job Description:</label>
                    <Textarea
                      placeholder="Describe the job position and responsibilities..."
                      value={jobDescription}
                      onChange={(event) =>
                        setJobDescription(event.target.value)
                      }
                    />
                  </div>

                  <div className="mx-5 my-5 mt-5 flex flex-col gap-2">
                    <label>Skills:</label>
                    <Input
                      placeholder="Ex. JavaScript, React, Node.js"
                      value={skills}
                      onChange={(event) => setSkills(event.target.value)}
                    />
                  </div>

                  <div className="mx-5 my-5 mt-5 flex flex-col gap-2">
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

          <DialogFooter className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>

            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={onSubmit}
              disabled={
                isProcessing ||
                (!resumeFile &&
                  !jobPosition &&
                  !jobDescription &&
                  !skills &&
                  !experience)
              }
            >
              {isProcessing ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
