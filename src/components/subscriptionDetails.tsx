"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSubscriptionStore } from "@/lib/susbcriptionStore";

type Subscription = {
  planType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd?: boolean;
  cancellationDate?: string | null;
  paymentStatus: "PAID" | "FAILED" | "UNPAID";
  pastDueAmount: number;
  pastDueCurrency: string | null;
};

export default function SubscriptionDetails() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const setPlanType = useSubscriptionStore((state) => state.setPlanType);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing auth token");

        const res = await axios.get("/api/subscriptionDetails", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSubscription(res.data);
        setPlanType(res.data.planType || "FREE");
      } catch (err: any) {
        console.error("Failed to fetch subscription:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [setPlanType]);

  if (loading) return <p className="text-gray-600">Loading subscription...</p>;
  if (!subscription) return <p className="text-gray-600">No active subscription found.</p>;

  const now = new Date();
  const startDate = new Date(subscription.startDate);
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
  const daysLeft = endDate ? Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

      const res = await axios.post("/api/cancel-subscription", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("Subscription cancellation scheduled");
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
          cancellationDate: subscription.endDate,
        });
        setPlanType("FREE");
      }
    } catch (err: any) {
      console.error("Cancel failed:", err.response?.data || err.message);
      alert("Failed to cancel subscription");
    }
  };

  let statusLabel;
  if (subscription.cancelAtPeriodEnd && subscription.cancellationDate) {
    statusLabel = (
      <span className="text-yellow-600">
        Cancelling on {new Date(subscription.cancellationDate).toLocaleDateString()}
      </span>
    );
  } else if (subscription.status === "ACTIVE") {
    statusLabel = <span className="text-green-600">{subscription.status}</span>;
  } else {
    statusLabel = <span className="text-red-600">{subscription.status}</span>;
  }

  let paymentLabel;
  if (subscription.paymentStatus === "PAID") {
    paymentLabel = <span className="text-green-600">{subscription.paymentStatus}</span>;
  } else if (subscription.paymentStatus === "FAILED") {
    paymentLabel = <span className="text-red-600">{subscription.paymentStatus}</span>;
  } else {
    paymentLabel = <span className="text-yellow-600">{subscription.paymentStatus}</span>;
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-lg border border-gray-200 mb-20">
      <ul className="space-y-2 text-gray-700">
        <li>
          <span className="font-semibold">Plan:</span> {subscription.planType}
        </li>
        <li>
          <span className="font-semibold">Status:</span> {statusLabel}
        </li>
        <li>
          <span className="font-semibold">Start Date:</span> {startDate.toLocaleDateString()}
        </li>
        {endDate && (
          <li>
            <span className="font-semibold">End Date:</span> {endDate.toLocaleDateString()}
          </li>
        )}
        {daysLeft !== null && (
          <li>
            <span className="font-semibold">Days Remaining:</span> {daysLeft}
          </li>
        )}
        <li>
          <span className="font-semibold">Payment Status:</span> {paymentLabel}
        </li>
        {subscription.pastDueAmount > 0 && (
          <li>
            <span className="font-semibold">Past Due:</span> {subscription.pastDueAmount}{" "}
            {subscription.pastDueCurrency}
          </li>
        )}
        {subscription.stripeSubscriptionId && (
          <li className="text-xs text-gray-500">Stripe ID: {subscription.stripeSubscriptionId}</li>
        )}
      </ul>

      {subscription.planType.toUpperCase() !== "FREE" &&
        subscription.status === "ACTIVE" &&
        !subscription.cancelAtPeriodEnd && (
          <div className="mt-6">
            <button
              onClick={handleCancel}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-purple-700 hover:to-blue-700 transition"
            >
              Cancel Subscription
            </button>
          </div>
        )}
    </div>
  );
}
