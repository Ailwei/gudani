"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/checkout-session?sessionId=${sessionId}`);
        setSession(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (isLoading)
    return <p className="text-center mt-10">Loading...</p>;

  if (!session)
    return <p className="text-center mt-10 text-red-500">Session not found.</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-green-700 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Thank you for subscribing.</p>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
