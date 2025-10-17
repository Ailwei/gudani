"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, CheckCircle } from "lucide-react";
import { useSubscriptionStore } from "@/lib/susbcriptionStore";


export enum PlanType {
  FREE = "FREE",
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
}

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  features: string[];
}

interface PlanSelectorProps {
  userId: string;
  onClose?: () => void;
  onUpgradeClick?: () => void;
  activePlan?: PlanType;
}

export default function PlanSelector({ userId, onClose, onUpgradeClick, activePlan }: PlanSelectorProps) {
  const plans: Plan[] = [
    {
      id: PlanType.FREE,
      name: "Free",
      price: "R0 / month",
      features: [
        "5 AI questions per day",
        "Basic flashcards",
        "Simple quizzes",
        "Note summaries (limited)",
      ],
    },
    {
      id: PlanType.STANDARD,
      name: "Standard",
      price: "R50 / month",
      features: [
        "More AI questions per day",
        "Limited flashcards and quizzes",
        "Progress tracking",
        "Grade-specific content",
      ],
    },
    {
      id: PlanType.PREMIUM,
      name: "Premium",
      price: "R120 / month",
      features: [
        "Unlimited AI questions",
        "Unlimited flashcards, quizzes, and summaries",
        "Advanced features",
        "Priority support",
      ],
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { setPlanType, planType, fetchSubscription } = useSubscriptionStore();



  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetchSubscription(token).then(() => {
    const initialSelectedPlan = activePlan
      ? plans.find(p => p.id === activePlan)
      : plans.find(p => p.id === planType);

    setSelectedPlan(initialSelectedPlan || null);
    setFetching(false);
  });
}, [activePlan, fetchSubscription]);



  const handleSelectPlan = (plan: Plan) => setSelectedPlan(plan);

  const handleSubscribe = async () => {
  if (!selectedPlan) return;

  setLoading(true);
  try {
    const email = localStorage.getItem("email");
    if (!email) throw new Error("User email not found");

    const response = await axios.post("/api/subscribe", {
      userId,
      planType: selectedPlan.id,
      email,
    });

    if (response.data.url) {
      window.location.href = response.data.url;
    }

    setPlanType(selectedPlan.id);

    setSelectedPlan(selectedPlan);
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || "Something went wrong";
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-between">
                {plan.name}
                {plan.id === planType && (
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded-full ml-2">
                    Current
                  </span>
                )}
              </h3>
              <p className="mt-4 text-xl font-medium text-gray-700">{plan.price}</p>
              <ul className="mt-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              {!loading && (planType === PlanType.FREE || planType === PlanType.STANDARD) && plan.id === planType && onUpgradeClick && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={onUpgradeClick}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

       {selectedPlan?.id !== planType && (
  <div className="mt-12 flex justify-center">
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`px-10 py-4 rounded-xl font-semibold text-lg shadow-md transition-colors ${
        loading
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
      }`}
    >
      {loading
        ? "Redirecting..."
        : selectedPlan?.id === PlanType.FREE
        ? "Downgrade Plan"
        : "Subscribe Now"}
    </button>
  </div>
)}


      </div>
    </div>
  );
}
