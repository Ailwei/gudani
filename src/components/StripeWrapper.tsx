"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeWrapperProps {
  children: React.ReactNode;
}

export default function StripeWrapper({ children }: StripeWrapperProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
