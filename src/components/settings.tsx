"use client";
import { useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import SubscriptionDetails from "./subscriptionDetails";
import ProfileUpdate from "@/components/updateProfile";
import DeleteAccount from "./deleteAccount";
import BillingDetails from "./billing";


const settingsLinks = [
  { label: "Profile", value: "profile" },
  { label: "Subscription", value: "subscription" },
  { label: "Billing", value: "billing" },
  { label: "Delete Account", value: "deleteAccount" },
];

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderActiveTab = () => (
    <>
      {activeTab === "profile" && <ProfileUpdate />}
      {activeTab === "subscription" && <SubscriptionDetails />}
      {activeTab === "billing" && <BillingDetails />}
      {activeTab === "deleteAccount" && (
        <div className="text-red-600 font-semibold">
          <DeleteAccount onDelete={() => (window.location.href = "/login")} />
        </div>
      )}
    </>
  );

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="hidden md:grid md:grid-cols-4 md:gap-8">
        <aside className="space-y-6 bg-gray-50 p-4 rounded-lg shadow-sm sticky top-4 h-fit">
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
          <div className="bg-white shadow-md rounded-lg p-6 min-h-[500px] relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {settingsLinks.find((link) => link.value === activeTab)?.label}
            </h3>

            <div className="space-y-6">{renderActiveTab()}</div>
          </div>
        </section>
      </div>

<div className="md:hidden">
  <div className="space-y-2">
    {settingsLinks.map(({ label, value }) => (
      <button
        key={value}
        onClick={() => setActiveTab(value)}
        className={clsx(
          "px-3 py-2 rounded-md text-sm font-medium flex-shrink-0",
          activeTab === value
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-600"
        )}
      >
        {label}
      </button>
    ))}
  </div>

  <div className="bg-white shadow-md rounded-lg p-4 min-h-[400px] relative mt-4">
    <button
      onClick={onClose}
      className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800"
    >
      <X className="w-5 h-5" />
    </button>

    <h3 className="text-lg font-semibold text-gray-800 mb-4 pr-10">
      {settingsLinks.find((link) => link.value === activeTab)?.label}
    </h3>

    <div className="space-y-6">{renderActiveTab()}</div>
  </div>
</div>
</div>
  );
}
