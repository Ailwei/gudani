"use client";
import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import Image from "next/image";

const cardLogos: Record<string, string> = {
  visa: "/card-logos/visa.svg",
  mastercard: "/card-logos/mastercard.svg",
  amex: "/card-logos/amex.svg",
  discover: "/card-logos/generic-card.svg",
  default: "/card-logos/generic-card.svg",
};

interface Card {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export default function BillingDetails() {
  const stripe = useStripe();
  const elements = useElements();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCardInput, setShowCardInput] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchCard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/cardsList", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      if (data.cards && data.cards.length > 0) {
        const first = data.cards[0];
        setCard({
          brand: first.card.brand,
          last4: first.card.last4,
          exp_month: first.card.exp_month,
          exp_year: first.card.exp_year,
          id: first.id,
        });
      } else {
        setCard(null);
      }
    } catch (err) {
      console.error("Error fetching card:", err);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!card || !confirm("Are you sure you want to remove this card?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete("/api/removeCard", {
        data: { paymentMethodId: card.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("Card removed successfully!");
        setCard(null);
      } else {
        alert(res.data.error || "Failed to remove card");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while removing card");
    }
  };

  const handleAddOrReplace = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert("Card input not loaded yet");
      setProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      alert(error.message);
      setProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/replaceCard",
        { paymentMethodId: paymentMethod!.id,
          replace: false
         },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Card updated successfully");
        setShowCardInput(false);
        fetchCard();
      } else {
        alert(res.data.error || "Failed to update card");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating card");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  if (loading) return <p className="text-gray-700">Loading card...</p>;

  return (
    <div className="max-w-md mx-auto space-y-4">
      {card && !showCardInput && (
        <div className="p-6 border rounded-xl shadow-md bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4 mb-4">
            <Image width={34} height={34}
              src={cardLogos[card.brand.toLowerCase()] || cardLogos.default}
              alt={card.brand}
              className="w-14 h-10 object-contain"
            />
            <div>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {card.brand} •••• {card.last4}
              </p>
              <p className="text-sm text-gray-600">
                Expires {card.exp_month}/{card.exp_year}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCardInput(true)}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
            >
              Replace Card
            </button>
            <button
              onClick={handleRemove}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
            >
              Remove Card
            </button>
          </div>
        </div>
      )}

      {(!card || showCardInput) && (
        <div className="p-6 border rounded-xl shadow-md bg-gradient-to-r from-gray-50 to-white">
          <p className="text-gray-700 mb-4">
            {card ? "Enter new card details" : "No card linked yet. Add one below."}
          </p>
          <div className="mb-4">
            <CardElement
  options={{
    style: {
      base: { fontSize: "16px", color: "#32325d" },
      invalid: { color: "#fa755a" },
    },
    hidePostalCode: true,
    wallet: 'never',
  } as any}
/>
          </div>
          <button
            onClick={handleAddOrReplace}
            disabled={processing}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
          >
            {processing ? "Processing..." : card ? "Replace Card" : "Add Card"}
          </button>
        </div>
      )}
    </div>
  );
}
