"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

type Flashcard = {
  id: string;
  front: string;
  back: string;
};

type FlashcardSet = {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  cards: Flashcard[];
};

interface FlashcardListProps {
  onSelectSet: (set: FlashcardSet) => void;
}

export default function FlashcardList({ onSelectSet }: FlashcardListProps) {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await axios.get("/api/getSavedFlashCards", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSets(res.data.flashcards || []);
      } catch (err: any) {
        setError(
          err.response?.data?.error || err.message || "Failed to fetch flashcards"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  if (loading) return <p className="text-center mt-4 text-purple-600 animate-pulse">Loading flashcards...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">My Flashcards</h1>
      <div className="flex-1 overflow-y-auto space-y-2">
        {sets.length === 0 && <p className="text-gray-500">No flashcards saved yet.</p>}
        {sets.map((set) => (
          <button
            key={set.id}
            onClick={() => {
              onSelectSet(set);
              setSelectedId(set.id);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              selectedId === set.id ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
            } text-gray-900`}
          >
            {set.topic}
          </button>
        ))}
      </div>
    </div>
  );
}
