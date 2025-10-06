"use client";

import { useEffect, useState } from "react";
import CheckoutForm from "./checkOutForm";

export default function CheckoutPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedPlanType = localStorage.getItem("planType");
    const storedEmail = localStorage.getItem("userEmail");
    console.log(userEmail)

    if (storedUserId && storedPlanType && storedEmail) {
      setUserId(storedUserId);
      setPlanType(storedPlanType);
      setUserEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading user info...</div>;
  if (!userId || !planType || !userEmail) return <div>Missing user info</div>;

  return (
    <div className="min-h-screen flex justify-center items-center">
      <CheckoutForm userId={userId} planType={planType} userEmail={userEmail} />
    </div>
  );
}
