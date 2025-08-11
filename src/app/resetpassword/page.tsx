"use client";
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { resetPasswordSchema } from "@/schemas/auth";

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      resetPasswordSchema.parse({ password, confirmPassword });

      const res = await axios.post('/api/auth/resetPassword', {
        password,
        confirmPassword,
        token,
      });
      setSuccess(res.data.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      if (err.errors) {
        setError(
          err.errors
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(" | ")
        );
      } else if (err.response?.data?.errors) {
        setError(
          err.response.data.errors
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(" | ")
        );
      } else {
        setError(err.response?.data?.error || "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
      }
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
          Set a New Password
        </h2>
        <form className="space-y-5" onSubmit={handleReset}>
          {/* Remove hardcoded password message */}
          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-center font-semibold">{success}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500  text-gray-900 font-normal"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500  text-gray-900 font-normal"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          <a href="/login" className="text-purple-600 hover:underline">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
