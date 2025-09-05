"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/checkout-session?sessionId=${sessionId}`);
        setSession(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (!session)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-green-600 mb-2 text-5xl">✓</div>
            <h1 className="text-4xl font-extrabold text-green-700 mb-2">
Payment Successful!</h1>
          <p className="text-gray-600">Thank you for subscribing.</p>
        </div>
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
