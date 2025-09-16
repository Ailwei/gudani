"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteSummary from "./deleteSavedSummary";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";


interface Summary {
  id: string;
  subject?: string;
  grade?: string;
  summary: string;
  topic: string;
  created: string;
}

interface SummaryListProps {
onSelectSummary: (summary: { summary: string; topic: string; summaryId: string }) => void;}

const SummaryList: React.FC<SummaryListProps> = ({ onSelectSummary }) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
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
      }
    };

    fetchSummaries();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
const deleteSummaryUi = (summaryId: string) => {
  setSummaries((prev) => prev.filter((summary) => summary.id !== summaryId));
};

  return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Saved Summaries</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {summaries.length === 0 && (
          <p className="text-gray-500">No summaries saved yet.</p>
        )}
        {summaries.map((summary) => (
          <div
                      key={summary.id}

      className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-200"
      >  

          <button
              onClick={() => {
                setSelectedId(summary.id);
                onSelectSummary({
                  summary: summary.summary,
                  topic: summary.topic,
                  summaryId: summary.id,
                });
              }}
              className={`flex-1 text-left text-gray-900 truncate ${
                selectedId === summary.id ? "bg-blue-100" : ""
              }`}
            >
              {summary.topic}
            </button>
          <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
    <Menu.Item>
      {({ active }) => (
         <DeleteSummary summaryId={summary.id} onDelete={() => deleteSummaryUi(summary.id)}
           className={`${
        active ? "bg-red-100 text-red-600" : "text-red-500"
      } w-full px-4 py-2 text-sm text-left`}
        />
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>
         
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryList;
