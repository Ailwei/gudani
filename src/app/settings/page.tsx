"use client";

import { useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import SubscriptionDetails from "../../components/subscriptionDetails";
import ProfileUpdate from "@/components/updateProfile";

const settingsLinks = [
  { label: "Profile", value: "profile" },
  { label: "Subscription", value: "subscription" },
  { label: "Security", value: "security" },
  { label: "Delete Account", value: "deleteAccount" },
];

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 min-h-screen">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <aside className="space-y-6 md:space-y-4 bg-gray-50 p-4 rounded-lg shadow-sm md:shadow-none sticky top-4">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <nav className="space-y-2">
          {settingsLinks.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={clsx(
                "block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                activeTab === value
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="md:col-span-3">
        <div className="bg-white shadow-md rounded-lg p-6 min-h-[500px]">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            {settingsLinks.find((link) => link.value === activeTab)?.label}
          </h3>

          <div className="space-y-6">
            {activeTab === "profile" && <ProfileUpdate />}
            {activeTab === "subscription" && <SubscriptionDetails />}
            {activeTab === "security" && (
              <div className="text-gray-600">Security settings go here</div>
            )}
            {activeTab === "deleteAccount" && (
              <div className="text-red-600 font-semibold">
                Delete account settings go here
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
