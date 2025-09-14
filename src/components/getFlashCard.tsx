"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DeleteFlashCard from "./deleteSavedFlashCard";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

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
      }
    };

    fetchFlashcards();
  }, []);

  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  const handleDeleteFlashCards = (setId: string) => {
  setSets((prev) => prev.filter((set) => set.id !== setId));
};

  return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">My Flashcards</h1>
      <div className="flex-1 overflow-y-auto space-y-2">
        {sets.length === 0 && <p className="text-gray-500">No flashcards saved yet.</p>}
        {sets.map((set) => (
<div
      className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100"
      >          <button
            key={set.id}
            onClick={() => {
              onSelectSet(set);
              setSelectedId(set.id);
            }}
            className="flex-1 text-left text-gray-900 truncate"

          >
            {set.topic}
          </button>
        <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
    <Menu.Item>
      {({ active }) => (
        <DeleteFlashCard
          setId={set.id}
          onDelete={() => handleDeleteFlashCards(set.id)}
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
}
