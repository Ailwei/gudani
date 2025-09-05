"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./checkOutForm";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage({ userId, planType }: { userId: string; planType: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    axios.post("/api/subscribe", { userId, planType }).then(res => {
      setClientSecret(res.data.clientSecret);
    }).catch(console.error);
  }, [userId, planType]);

  if (!clientSecret) return <div>Loading checkout...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm userId={userId} planType={planType} />
    </Elements>
  );
}
