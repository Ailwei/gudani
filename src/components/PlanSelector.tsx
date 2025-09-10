"use client";

import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: string;
  type: string;
}

interface PlanSelectorProps {
  userId: string;
  onClose?: () => void;
}

export default function PlanSelector({ userId, onClose }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const plans: Plan[] = [
    { id: "standard", name: "Standard", price: "R50 / month", type: "standard" },
    { id: "premium", name: "Premium", price: "R120 / month", type: "premium" },
  ];

  const handleSelectPlan = (plan: Plan) => setSelectedPlan(plan);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await axios.post("/api/subscribe", {
        userId,
        planType: selectedPlan.type,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Something went wrong";
      console.error("Checkout Error:", errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 sm:px-6 py-12">
      <div className="mx-auto w-full max-w-5xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-3 text-gray-600 hover:text-gray-800 bg-white rounded-full shadow-md md:p-2 md:bg-transparent"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12 mt-16 md:mt-0">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`cursor-pointer p-8 rounded-2xl shadow-lg border transition-all duration-200 ${
                selectedPlan?.id === plan.id
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="mt-4 text-xl font-medium text-gray-700">
                {plan.price}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`px-10 py-4 rounded-xl font-semibold text-lg shadow-md transition-colors ${
              !selectedPlan
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            }`}
          >
            {loading ? "Redirecting..." : "Subscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
