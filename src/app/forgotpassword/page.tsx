"use client";
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgotPassword', { email });
      setSuccess(res.data.message);
      console.log(res)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

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
          GudaniSmartAI
        </span>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Forgot Your Password?
        </h2>
        <form className="space-y-5" onSubmit={handleForgotPassword}>
          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-center font-semibold">{success}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-normal"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Remembered your password? <a href="/login" className="text-purple-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
