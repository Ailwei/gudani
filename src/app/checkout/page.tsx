"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./checkOutForm";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedPlanType = localStorage.getItem("planType");

    if (storedUserId && storedPlanType) {
      setUserId(storedUserId);
      setPlanType(storedPlanType);

      axios.post("/api/subscribe", { userId: storedUserId, planType: storedPlanType })
        .then(res => setClientSecret(res.data.clientSecret))
        .catch(console.error);
    }
  }, []);

  if (!userId || !planType) return <div>Loading user info...</div>;
  if (!clientSecret) return <div>Loading checkout...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm userId={userId} planType={planType} />
    </Elements>
  );
}
