"use client";
import React, { useEffect } from 'react';
import { db } from "@/utils/db";
import { InterviewSessionTable } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Webcam = dynamic(() => import('react-webcam'), { ssr: false });


function StartInterview({ params }) {
    const { interview: interviewId } = React.use(params);
    const [interviewData, setInterviewData] = React.useState(null);
    const [webCamEnabled, setWebcamEnabled] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        console.log("Interview ID from URL:", interviewId);
    }, [interviewId]);

    const GetInterviewDetails = async () => {
        try {
            setLoading(true);
            const result = await db.select().from(InterviewSessionTable).where(eq(InterviewSessionTable.mockId, interviewId));
            console.log("Interview Details:", result);
            if (result && result.length > 0) {
                setInterviewData(result[0]);
            }
        } catch (error) {
            console.error("Error fetching interview details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetInterviewDetails();
    }, [interviewId]);

    return (
        <div className='my-4 flex w-full flex-col items-center justify-center'>
            <h2 className='mb-8 text-center text-3xl font-extrabold text-slate-900 md:text-4xl'>Let's Start the Interview</h2>
            
            <div className='grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2'>
                {/* Webcam Section */}
                <div className='flex flex-col items-center justify-center p-5'>
                    <div className='w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/80'>
                        {webCamEnabled ? (
                            <Webcam 
                                onUserMedia={() => setWebcamEnabled(true)}
                                onUserMediaError={() => setWebcamEnabled(false)}
                                style={{
                                    height: '100%',
                                    width: '100%'
                                }}
                                mirrored={true}
                            />
                        ) : (
                            <WebcamIcon className='h-60 w-full animate-pulse p-5 text-slate-500' />
                        )}
                    </div>
                    <button 
                        variant="ghost"
                        className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-4 py-2 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white' 
                        onClick={() => setWebcamEnabled(true)}
                    >
                        Allow Webcam and Microphone Access
                    </button>
                    <div className='mt-8 flex w-full justify-center'>
                        <Link href={`/dashboard/interview/${interviewId}/start_Interview`} className='w-full'>
                            <Button className='cta-shine w-full bg-gradient-to-r from-teal-600 to-orange-500 text-white hover:from-teal-700 hover:to-orange-600'>Start Interview</Button>
                        </Link>
                    </div>
                </div>

                {/* Interview Details Section */}
                <div className='flex flex-col p-5 md:p-6'>
                    <h3 className='mb-4 text-xl font-semibold text-slate-900'>Interview Information</h3>
                    
                    {loading ? (
                        <div className='flex h-40 items-center justify-center'>
                            <p className='text-slate-500'>Loading interview details...</p>
                        </div>
                    ) : interviewData ? (
                        <Tabs defaultValue="job-details" className='w-full'>
                            <TabsList className='mb-4 grid w-full grid-cols-2 rounded-xl bg-slate-100/90'>
                                <TabsTrigger value="job-details">Job Details</TabsTrigger>
                                <TabsTrigger value="resume">Resume</TabsTrigger>
                            </TabsList>

                            {/* Job Details Tab */}
                            <TabsContent value="job-details" className='space-y-4'>
                                <div className='space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4'>
                                    <div>
                                        <p className='text-sm text-slate-600'><strong>Job Position</strong></p>
                                        <p className='text-base'>{interviewData?.jobPosition || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-slate-600'><strong>Required Skills</strong></p>
                                        <p className='text-base'>{interviewData?.skills || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-slate-600'><strong>Experience Level</strong></p>
                                        <p className='text-base'>{interviewData?.jobExperience || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-slate-600'><strong>Job Description</strong></p>
                                        <p className='text-base whitespace-pre-wrap'>{interviewData?.jobDescription || 'N/A'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Resume Tab */}
                            <TabsContent value="resume" className='space-y-4'>
                                <div className='space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4'>
                                    <div>
                                        <p className='text-sm text-slate-600'><strong>User_ID</strong></p>
                                        <p className='text-base'>{interviewData?.userId || 'N/A'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                        </Tabs>
                        
                    ) : (
                        <div className='rounded-xl border border-slate-200 bg-white/80 p-4 text-center text-slate-500'>
                            <p>No interview data found</p>
                        </div>
                    )}
                    <div className='mt-6 rounded-xl border border-amber-300 bg-amber-50/90 p-5'>
                        <h2 className='flex items-center gap-2 text-amber-700'><Lightbulb/><strong>Information</strong></h2>
                        <h2 className='mt-2 text-sm leading-relaxed text-amber-700'>
                           Enabled webcam and Microphone to Start your interview. It has 10 Questions which you can answer and at the last you will get the report on the basis of your performance your Body Language and Speech Tone. NOTE: We never record your video and audio during the interview. Please ensure you have a stable internet connection for the best experience. 
                        </h2>
                    </div>
                    
                </div>
                
            </div>
        </div>
    )
}

export default StartInterview
