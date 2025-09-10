"use client";

import React, { useEffect, useState } from "react";
import { Brain, SettingsIcon, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import UpgradeButton from "./buttonCheckout";
import { useSubscriptionStore } from "@/lib/susbcriptionStore";
import { useUserStore } from "@/lib/userStore";

interface HeaderProps {
  variant?: "dashboard" | "landing";
  isLoggedIn?: boolean;
  userName?: string;
  onUpgradeClick: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  variant = "landing",
  onUpgradeClick,
  isLoggedIn = false,
  userName,
  onSettingsClick,
}) => {
  const router = useRouter();

  const { planType, setPlanType } = useSubscriptionStore();
  const { firstName, lastName, setUser, clearUser } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = firstName ? `${firstName} ${lastName}` : userName || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/userDetails", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data);
        }

        const subRes = await fetch("/api/subscriptionDetails", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setPlanType(subData.planType || "FREE");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setUser, setPlanType, userName]);

  const handleLogoClick = () => {
    router.push(isLoggedIn ? "/dashboard" : "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    clearUser();
    router.push("/login");
  };

  const renderPlanLabel = () => {
    if (loading) return <span className="text-gray-400">...</span>;
    return <span>{planType} Plan</span>;
  };

  if (variant === "dashboard") {
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StudySmartAI
              </h1>
              <p className="text-sm text-gray-600">
                AI Study Assistant for Grades 8-12
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
              {renderPlanLabel()}
            </span>
            {!loading && (planType === "FREE" || planType === "STANDARD") && (
              <UpgradeButton onClick={onUpgradeClick} />
            )}

            <p className="text-sm font-medium text-gray-900">
              {displayName || <span className="text-gray-400">...</span>}
            </p>

            <button
              onClick={() => {
                onSettingsClick?.();
                setMobileMenuOpen(false);
              }}

              title="Settings"
              className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition"
            >
              <SettingsIcon className="w-5 h-5 text-purple-600" />
            </button>

            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2 flex flex-col gap-3 md:hidden bg-white shadow-lg rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{displayName || "..."}</span>
                <span className="text-sm text-gray-500">{planType} Plan</span>
              </div>
              {!loading && (planType === "FREE" || planType === "STANDARD") && (
                <UpgradeButton
  onClick={() => {
    onUpgradeClick();
    setMobileMenuOpen(false);
  }}
/>
              )}
            </div>

            <hr className="border-gray-200" />
            <button
              onClick={() => {
                onSettingsClick?.();
                setMobileMenuOpen(false);
              }}
              title="Settings"
              className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition"
            >
              <SettingsIcon className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </header>
    );
  }
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StudySmartAI
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-purple-600">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 hover:text-purple-600">
              About
            </a>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && variant === "landing" && (
          <div className="mt-2 space-y-2 md:hidden flex flex-col">
            <a href="#features" className="text-gray-700 hover:text-purple-600 px-4 py-2">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600 px-4 py-2">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 hover:text-purple-600 px-4 py-2">
              About
            </a>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg mx-4">
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
