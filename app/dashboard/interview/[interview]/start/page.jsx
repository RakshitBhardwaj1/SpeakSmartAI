"use client";
import React, { useEffect } from 'react';
import { db } from "@/utils/db";
import { InterviewSessionTable } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { WebcamIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Webcam = dynamic(() => import('react-webcam'), { ssr: false });


function StartInterview({ params }) {
    const { interview: interviewId } = React.use(params);
    const [interviewData, setInterviewData] = React.useState(null);
    const [webCamAllowed, setWebcamAllowed] = React.useState(false);
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
        <div className='my-10 flex justify-center flex-col items-center w-full px-4'>
            <h2 className='text-3xl font-bold mb-8'>Let's Start the Interview</h2>
            
            <div className='w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Webcam Section */}
                <div className='flex flex-col items-center justify-center'>
                    <div className='w-full rounded-lg border overflow-hidden bg-secondary'>
                        {webCamAllowed ? (
                            <Webcam 
                                onUserMedia={() => setWebcamAllowed(true)}
                                onUserMediaError={() => setWebcamAllowed(false)}
                                style={{
                                    height: '100%',
                                    width: '100%'
                                }}
                            />
                        ) : (
                            <WebcamIcon className='h-80 w-full p-10 text-gray-500 animate-pulse' />
                        )}
                    </div>
                    <button 
                        className='mt-5 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition' 
                        onClick={() => setWebcamAllowed(true)}
                    >
                        Allow Webcam and Microphone Access
                    </button>
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
                                    <div>
                                        <p className='text-sm text-gray-600'><strong>Resume</strong></p>
                                        <p className='text-base whitespace-pre-wrap'>{interviewData?.mockResponse || 'No resume data available'}</p>
                                    </div>
                                    <div className='pt-4 border-t'>
                                        <p className='text-sm text-gray-600'><strong>Interview Duration</strong></p>
                                        <p className='text-base'>{interviewData?.duration || 'N/A'} minutes</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className='bg-gray-50 p-4 rounded-lg text-center text-gray-500'>
                            <p>No interview data found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StartInterview
