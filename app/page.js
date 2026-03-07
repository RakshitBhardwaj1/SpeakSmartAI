"use client";
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Header from './dashboard/_components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <Header />
      
      {/* Hero Section */}
      <div
        className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
        <div
          className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div
            className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>
        <div
          className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div
            className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
          <div
            className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="px-4 py-10 md:py-20">
          <h1
            className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
            {"Ace Your Interview with AI-Powered Practice"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-2 inline-block">
                  {word}
                </motion.span>
              ))}
          </h1>
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 0.8,
            }}
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400">
            Master your interview skills with AI-generated questions tailored to your resume and job role. 
            Get instant feedback, track your progress, and land your dream job with confidence.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 1,
            }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <button
                className="w-60 transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                Explore Now
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                className="w-60 transform rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 font-semibold text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30">
                Get Started
              </button>
            </Link>
          </motion.div>
          
          {/* Features Section */}
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: 1.2,
            }}
            className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950/50">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI-Powered Questions</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized interview questions based on your resume and target job role using advanced AI.
              </p>
            </div>
            
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-950/50">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Instant Feedback</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Receive real-time analysis of your answers with suggestions for improvement and best practices.
              </p>
            </div>
            
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-950/50">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Track Progress</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your improvement over time with detailed analytics and performance tracking.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    )
  }

  