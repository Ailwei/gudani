"use client";

import { useEffect } from "react";

export default function VerifySuccess() {
  useEffect(() => {
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
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
