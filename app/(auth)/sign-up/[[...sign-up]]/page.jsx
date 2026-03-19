import { SignUp } from '@clerk/nextjs'
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 transform transition duration-500 hover:scale-105">
        

        <SignUp />

      </div>

    </div>
  );
}