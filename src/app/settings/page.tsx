"use client"
import { useState } from "react"
import clsx from "clsx"
import SubscriptionDetails from "../../components/subscriptionDetails"
import ProfileUpdate from "@/components/updateProfile"

const settingsLinks = [
  { label: "Profile", value: "profile" },
  { label: "Subscription", value: "subscription" },
  { label: "Security", value: "security" },
  { label: "Delete Account", value: "deleteAccount" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        <nav className="space-y-2">
          {settingsLinks.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={clsx(
                "block w-full text-left px-3 py-2 rounded-md text-sm font-medium",
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
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {settingsLinks.find(link => link.value === activeTab)?.label}
          </h3>
          {activeTab === "profile" && <div><ProfileUpdate/></div>}
          {activeTab === "subscription" && <SubscriptionDetails />}
          {activeTab === "security" && <div>Security settings go here</div>}
          {activeTab === "deleteAccount" && <div>Delete account settings go here</div>}
        </div>
      </section>
    </div>
  )
}
