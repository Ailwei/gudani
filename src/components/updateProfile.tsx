"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/lib/userStore";
import axios from "axios";

const ProfileUpdate: React.FC = () => {
  const { firstName, lastName, email, setUser } = useUserStore();

  const [fName, setFName] = useState(firstName || "");
  const [lName, setLName] = useState(lastName || "");
  const [userEmail, setUserEmail] = useState(email || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setFName(firstName || "");
    setLName(lastName || "");
    setUserEmail(email || "");
  }, [firstName, lastName, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await axios.post(
        "/api/auth/updateProfile",
        { firstName: fName, lastName: lName, email: userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUser(res.data.user);
        setSuccessMsg("Profile updated successfully!");
      } else {
        setErrorMsg("Failed to update profile. Try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={lName}
            onChange={(e) => setLName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}
        {errorMsg && <p className="text-red-600 font-medium">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-md hover:from-purple-700 hover:to-blue-700 transition-colors"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileUpdate;
