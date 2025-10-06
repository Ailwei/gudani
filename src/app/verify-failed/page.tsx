"use client";

import { useEffect } from "react";

export default function VerifyFailed() {
  useEffect(() => {
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-red-600 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-4">
          Unfortunately, your payment could not be processed.
        </p>
        <button
          onClick={() => (window.location.href = "/plans")}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
