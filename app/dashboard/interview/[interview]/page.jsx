"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


function Interview({ params }) {
    // Unwrap the params promise using React.use()
    const { interview: interviewId } = React.use(params);
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="p-6">
        <Image src="/interview.png" alt="Interview" width={600} height={400} />
        <div className="text-center p-4">
          <h1 className="font-bold text-2xl my-2 mt-2">
            Ready to Start Interview?
          </h1>
          <p>Click the button below to start your interview session.</p>
          <Button className="mt-4">
            <Link href={`/dashboard/interview/${interviewId}/start`}>
              Start Interview
            </Link>
          </Button>
          <hr className="my-6" />
        </div>
      </div>
    </div>

  );
}

export default Interview;
