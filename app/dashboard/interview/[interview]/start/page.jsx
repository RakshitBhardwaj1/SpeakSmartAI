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
        <div className='my-4 flex justify-center flex-col items-center w-full '>
            <h2 className='text-3xl font-bold mb-8'>Let's Start the Interview</h2>
            
            <div className='w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Webcam Section */}
                <div className='flex flex-col items-center justify-center'>
                    <div className='w-full rounded-lg border overflow-hidden bg-secondary'>
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
                            <WebcamIcon className='h-60 w-full p-5 text-gray-500 animate-pulse' />
                        )}
                    </div>
                    <button 
                        variant="ghost"
                        className='w-full hover:bg-gray-100 mt-4 text-gray-700 rounded-lg py-2 px-4 flex items-center justify-center gap-2' 
                        onClick={() => setWebcamEnabled(true)}
                    >
                        Allow Webcam and Microphone Access
                    </button>
                    <div className='flex mt-8 justify-center w-full'>
                        <Link href={`/dashboard/interview/${interviewId}/start_Interview`} className='w-full'>
                            <Button className='bg-blue-600 hover:bg-blue-700 text-white w-full'>Start Interview</Button>
                        </Link>
                    </div>
                </div>

                {/* Interview Details Section */}
                <div className='flex flex-col'>
                    <h3 className='text-xl font-semibold mb-4'>Interview Information</h3>
                    
                    {loading ? (
                        <div className='flex items-center justify-center h-40'>
                            <p className='text-gray-500'>Loading interview details...</p>
                        </div>
                    ) : interviewData ? (
                        <Tabs defaultValue="job-details" className='w-full'>
                            <TabsList className='grid w-full grid-cols-2 mb-4'>
                                <TabsTrigger value="job-details">Job Details</TabsTrigger>
                                <TabsTrigger value="resume">Resume</TabsTrigger>
                            </TabsList>

                            {/* Job Details Tab */}
                            <TabsContent value="job-details" className='space-y-4'>
                                <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
                                    <div>
                                        <p className='text-sm text-gray-600'><strong>Job Position</strong></p>
                                        <p className='text-base'>{interviewData?.jobPosition || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-600'><strong>Required Skills</strong></p>
                                        <p className='text-base'>{interviewData?.skills || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-600'><strong>Experience Level</strong></p>
                                        <p className='text-base'>{interviewData?.jobExperience || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-600'><strong>Job Description</strong></p>
                                        <p className='text-base whitespace-pre-wrap'>{interviewData?.jobDescription || 'N/A'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Resume Tab */}
                            <TabsContent value="resume" className='space-y-4'>
                                <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
                                    <div>
                                        <p className='text-sm text-gray-600'><strong>User_ID</strong></p>
                                        <p className='text-base'>{interviewData?.userId || 'N/A'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                        </Tabs>
                        
                    ) : (
                        <div className='bg-gray-50 p-4 rounded-lg text-center text-gray-500'>
                            <p>No interview data found</p>
                        </div>
                    )}
                    <div className='p-5 border rounded-lg border-yellow-500 mt-6 bg-yellow-100'>
                        <h2 className='flex gap-2 items-center text-yellow-500'><Lightbulb/><strong>Information</strong></h2>
                        <h2 className='mt-2 text-yellow-500'>
                           Enabled webcam and Microphone to Start your interview. It has 10 Questions which you can answer and at the last you will get the report on the basis of your performance your Body Language and Speech Tone. NOTE: We never record your video and audio during the interview. Please ensure you have a stable internet connection for the best experience. 
                        </h2>
                    </div>
                    
                </div>
                
            </div>
        </div>
    )
}

export default StartInterview
