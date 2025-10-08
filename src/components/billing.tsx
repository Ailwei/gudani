"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Script from "next/script";

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
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
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
          brand: first.brand,
          last4: first.last4,
          exp_month: first.exp_month,
          exp_year: first.exp_year,
          id: first.authorization_Code,
        });
      } else setCard(null);
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
      } else alert(res.data.error || "Failed to remove card");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while removing card");
    }
  };

  const paystackCallback = async (response: any) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/verifyCard",
        { reference: response.reference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Card saved successfully!");
      fetchCard();
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Card verification failed");
    }
  };

  const handleAddOrReplace = async () => {
  try {
    setProcessing(true);
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/replaceCard", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { email, paystackPublicKey } = res.data;

    if (!(window as any).PaystackPop) {
      alert("Paystack not loaded yet");
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: 100,
      currency: "ZAR",
      channels: ["card"],
      callback: function(response: any) {
        (async () => {
          try {
            await axios.post(
              "/api/verifyCard",
              { reference: response.reference },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Card saved successfully!");
            fetchCard();
          } catch (err) {
            console.error("Verification failed:", err);
            alert("Card verification failed");
          }
        })();
      },
      onClose: function() {
        alert("Card input cancelled");
      },
    });

    handler.openIframe();
  } catch (err) {
    console.error("Error initiating card input:", err);
    alert("Failed to initiate card input");
  } finally {
    setProcessing(false);
  }
};


  useEffect(() => {
    fetchCard();
  }, []);

  if (loading) return <p className="text-gray-700">Loading card...</p>;

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      <div className="max-w-md mx-auto space-y-4">
        {card ? (
          <div className="p-6 border rounded-xl shadow-md bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4 mb-4">
              <Image
                width={34}
                height={34}
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
                onClick={handleAddOrReplace}
                disabled={processing}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                {processing ? "Processing..." : "Replace Card"}
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                Remove Card
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border rounded-xl shadow-md bg-gradient-to-r from-gray-50 to-white space-y-4">
            <p className="text-gray-700">No card linked yet. Click below to add one via Paystack.</p>
            <button
              onClick={handleAddOrReplace}
              disabled={processing}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
            >
              {processing ? "Processing..." : "Add Card"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
