"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SyllabusForm from "@/components/syllabusForm";
import { Brain } from "lucide-react";

const AdminDashboardPage: React.FC = () => {
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch("/api/auth/userDetails", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          const data = await res.json();
          if (data.userRole !== "ADMIN") {
            window.location.href = "/login";
            return;
          }
          setIsAuthenticated(true);
        } else {
          window.location.href = "/login";
        }
      } catch {
        window.location.href = "/login";
      } finally {
        setIsAuthChecked(true);
      }
    }

    verifyToken();
  }, []);

    if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            StudySmartAI
          </span>
        </div>
        <div className="text-lg text-purple-600 font-semibold animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50">
<Header variant="dashboard" onUpgradeClick={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10">
        <h2 className="text-4xl font-extrabold mb-10 text-gray-800 tracking-tight">
          Admin Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold mb-4 text-purple-600">
              User Management
            </h3>
            <p className="text-gray-700 mb-6">
              View, promote, or remove users. Manage roles and permissions.
            </p>
            <button className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition">
              Manage Users
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">
              Analytics
            </h3>
            <p className="text-gray-700 mb-6">
              View usage statistics, activity logs, and system health.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 md:col-span-2">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              Seed Syllabus
            </h3>
            <p className="text-gray-700 mb-6">
              Seed or update syllabus content for all grades and subjects.
            </p>
            <button
              onClick={() => setShowSyllabus(!showSyllabus)}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition"
            >
              {showSyllabus ? "Hide Syllabus Form" : "Show Syllabus Form"}
            </button>

            {showSyllabus && (
              <div className="mt-6 border-t pt-6">
                <SyllabusForm
                  onSubmit={(data: any) =>
                    console.log("Seed syllabus chunk:", data)
                  }
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold mb-4 text-orange-600">
              System Settings
            </h3>
            <p className="text-gray-700 mb-6">
              Configure system-wide settings and integrations.
            </p>
            <button className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition">
              Settings
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
