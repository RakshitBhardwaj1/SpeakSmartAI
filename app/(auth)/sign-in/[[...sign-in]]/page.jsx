import { SignIn } from '@clerk/nextjs'
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 transform transition duration-500 hover:scale-105">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Welcome Back
        </h2>

        <SignIn />

      </div>

    </div>
  );
}