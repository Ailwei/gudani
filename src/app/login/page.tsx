"use client";
import React from 'react';
import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div
        className="mt-8 mb-8 flex items-center space-x-2 cursor-pointer"
        onClick={() => router.push('/')}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          StudySmartAI
        </span>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6">Login to StudySmartAI</h2>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors">
            Login
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          New here? <a href="/register" className="text-purple-600 hover:underline">Create an account</a>
        </p>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Forgot password? <a href="/forgotpassword" className="text-purple-600 hover:underline">Reset password</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
