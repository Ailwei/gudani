"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Summary {
  id: string;
  subject?: string;
  grade?: string;
  summary: string;
  topic: string;
  created: string;
}

interface SummaryListProps {
  onSelectSummary: (summary: Summary) => void;
}

const SummaryList: React.FC<SummaryListProps> = ({ onSelectSummary }) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await axios.get("/api/getSavedSummary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummaries(res.data.summaries || []);
      } catch (err: any) {
        setError(
          err.response?.data?.error || err.message || "Failed to fetch summaries"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  if (loading) return <div className="text-purple-600 animate-pulse">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Saved Summaries</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {summaries.length === 0 && (
          <p className="text-gray-500">No summaries saved yet.</p>
        )}
        {summaries.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onSelectSummary(s);
              setSelectedId(s.id);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              selectedId === s.id ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
            } text-gray-900`}
          >
            {s.topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SummaryList;
