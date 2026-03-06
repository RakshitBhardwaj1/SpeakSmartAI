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
  DialogTrigger,
  DialogFooter,
    DialogClose,
    DialogSubmit
} from "@/components/ui/dialog";
import ResumeUpload from "./ResumeUpload";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [jobPosition, setJobPosition] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [skills, setSkills] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    console.log(jobPosition, jobDescription, skills, experience);

    const InputPrompt =
      "Job Position: " +
      jobPosition +
      ", Job Description: " +
      jobDescription +
      ", Skills: " +
      skills +
      ", Year Of Experience: " +
      experience +
      ", Depend on this information please give me " +
      process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT +
      " interview question with answered in JSON formate, Give Question and Answer as field in JSON";

    const result = await generateContent(InputPrompt);
    console.log(result);
  };
  return (
    <div>
      <div
        className="p-10 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200 transform hover:scale-105
      "
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
              <Tabs defaultValue="resume-upload" className="w-full mt-3">
                <TabsList>
                  <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                  <TabsTrigger value="job-description">
                    Job Description
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="resume-upload">
                  <ResumeUpload/>
                </TabsContent>
                <TabsContent value="job-description">
                  <form onSubmit={onSubmit}>
                    <div>
                      <h2>
                        Add Details about job Position/role,Your Skills and
                        Experience
                      </h2>
                      <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                        <label>Job Position/Role:</label>
                        <Input
                          placeholder="Ex. Software Engineer,Full Stack Developer"
                          required
                          value={jobPosition}
                          onChange={(event) =>
                            setJobPosition(event.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                        <label>Job Description:</label>
                        <Textarea
                          placeholder="Describe the job position and responsibilities..."
                          required
                          value={jobDescription}
                          onChange={(event) =>
                            setJobDescription(event.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                        <label>Skills:</label>
                        <Input
                          placeholder="Ex. JavaScript, React, Node.js"
                          required
                          value={skills}
                          onChange={(event) => setSkills(event.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-5 mx-5 my-5">
                        <label>Year of Experience:</label>
                        <Input
                          placeholder="Ex. 2 years"
                          type="number"
                          min="0"
                          max="50"
                          required
                          value={experience}
                          onChange={(event) =>
                            setExperience(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex gap-5 justify-end'>
            <DialogClose>
                <Button variant={'ghost'}>Close</Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
