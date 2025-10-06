"use client";

import { PaystackButton } from "react-paystack";
import axios from "axios";

interface CheckoutFormProps {
  userId: string;
  planType: string;
  userEmail: string;
}

export default function CheckoutForm({ userId, planType, userEmail }: CheckoutFormProps) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

  const onSuccess = async (reference: any) => {
    try {
      await axios.post("/api/verify", {
        reference: reference.reference,
        userId,
        planType,
      });
      alert("Subscription successful!");
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Subscription verification failed.");
    }
  };

  const onClose = () => {
    console.log("Payment closed");
  };

  if (!userEmail) return <div>Loading...</div>;

  return (
    <PaystackButton
      email={userEmail}
      publicKey={publicKey}
      plan={planType}
      amount={0}
      text="Subscribe Now"
      onSuccess={onSuccess}
      onClose={onClose}
      className="px-4 py-2 bg-green-600 text-white rounded"
    />
  );
}
