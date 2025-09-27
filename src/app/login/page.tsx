"use client";
import { Suspense, useEffect } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain } from 'lucide-react';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const [plan, setPlan] = useState("FREE");



  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const planType = params.get("planType");
  if (planType) setPlan(planType.toUpperCase());
}, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      if(plan === "PREMIUM"){
        router.push("checkout");
      } else if (plan === "STANDARD"){
        router.push("checkout");
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(
          err.response.data.errors
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(" | ")
        );
      } else {
        setError(err.response?.data?.error || "Login failed");
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
          GudaniAI
        </span>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Login to GudaniAI
        </h2>
        <form className="space-y-5" onSubmit={handleLogin}>
          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500   text-gray-900 font-normal"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500  text-gray-900 font-normal"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
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
