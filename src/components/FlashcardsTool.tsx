"use client";
import React, { useEffect, useState } from "react";
import { Save, Menu, X } from "lucide-react";
import axios from "axios";
import FlashcardList from "./getFlashCard";
import GradeSubjectSelector from "./GradeSubjectSelector";

interface UserSelection {
  grade: string;
  subject: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardSet {
  id?: string;
  grade: string;
  subject: string;
  topic: string;
  cards: Flashcard[];
}

interface Topic {
  topic: string;
  chunks: {
    name: string;
    concepts: string[];
  }[];
}

interface FlashcardsToolProps {
  selection: UserSelection;
  onBack: () => void;
}

const FlashcardsTool: React.FC<FlashcardsToolProps> = ({
  selection,
  onBack,
}) => {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavedSet, setIsSavedSet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics,setTopics] = useState<Topic[]>([])
  const planType = useSubscriptionStore((state) => state.planType);
  


  useEffect(() => {
    const fetchTopics = async () => {
      try{
        const token = localStorage.getItem("token")
        const res = await axios.post("/api/getTopics",{
          grade: selection.grade,
          subject: selection.subject
        }
          , {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTopics(res.data.topics);
        console.log("gjhjjh", res.data.topics)      
      } catch(error){
        console.error(error);

      }
    }
    fetchTopics();
  } , [])
  const handleTopicSelect = (set: FlashcardSet) => {
    setTopic(set.topic);
    setFlashcards(set.cards);
    setCurrentCard(0);
    setShowAnswer(false);
    setError(null);
    setIsSavedSet(true);
    setSidebarOpen(false);
  };

  const generateFlashcardsForTopic = async (chosenTopic: string) => {
    if (!chosenTopic.trim()) return;
    setIsGenerating(true);
    setFlashcards([]);
    setCurrentCard(0);
    setShowAnswer(false);
    setError(null);
    setIsSavedSet(false);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/flashCard",
        {
          prompt: `Grade: ${selection.grade}\nSubject: ${selection.subject}\nTopic: ${chosenTopic}\nGenerate flashcards for this topic.`,
          grade: selection.grade,
          subject: selection.subject,
          topic: chosenTopic,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const cards: Flashcard[] = res.data.flashcards || [];
      if (cards.length === 0) {
        setError("No flashcards generated. Try a different topic.");
      } else {
        setFlashcards(cards);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to generate flashcards."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
  setCurrentCard((prev) => {
    const nextIndex = Math.min(prev + 1, flashcards.length - 1);
    setShowAnswer(false);
    return nextIndex;
  });
};

const handlePrev = () => {
  setCurrentCard((prev) => {
    const prevIndex = Math.max(prev - 1, 0);
    setShowAnswer(false);
    return prevIndex;
  });
};

  const handleShowAnswer = () => setShowAnswer(!showAnswer);

  const handleGenerateNewSet = () => {
    setFlashcards([]);
    setTopic("");
    setCurrentCard(0);
    setShowAnswer(false);
    setError(null);
    setIsSavedSet(false);
  };

  const handleSaveFlashcards = async () => {
     if(planType === "FREE"){
    alert("Saving quizzes is not available on the Free plan. Please upgrade to unlock this feature.");
    return;      
    }
    if (!flashcards.length) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/saveFlashCards",
        {
          grade: selection.grade,
          subject: selection.subject,
          topic,
          cards: flashcards.map((c) => ({
            front: c.front,
            back: c.back,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Flashcards saved successfully!");
      handleCloseFlashcards();
    } catch (err: any) {
      console.error("Save flashcards error:", err.response?.data || err.message);
      alert("Failed to save flashcards. Please try again.");
    }
  };
  const handleCloseFlashcards = () => {
  setFlashcards([]);
  setTopic("");
  setCurrentCard(0);
  setShowAnswer(false);
  setError(null);
  setIsSavedSet(false);

};

  return (
    <div className="flex h-screen gap-2">
      <div className="hidden md:block w-64 border-r border-gray-200">
        <FlashcardList onSelectSet={handleTopicSelect} />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
            <div className="p-4 border-b flex justify-end">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <FlashcardList onSelectSet={handleTopicSelect} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Flashcards</h2>
              <p className="text-gray-600">
                {selection.grade} • {selection.subject}
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Tools
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {flashcards.length === 0 ? (
            <>
            <div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic for flashcards
                 <div className="flex flex-wrap gap-2">
    {topics.map((t) => (
      <button
        key={t.topic}
        type="button"
        onClick={() => {
          setTopic(t.topic);
          generateFlashcardsForTopic(t.topic);
        }}
        className={`px-3 py-1 rounded-full border text-sm ${
          topic === t.topic
            ? "bg-purple-600 text-white border-purple-600"
            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-100"
        }`}
      >
        {t.topic}
      </button>
    ))}
  </div>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Chemical Bonding, Poetry Analysis"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-normal"
                />
              </div>
              <button
                onClick={() => generateFlashcardsForTopic(topic)}
                disabled={!topic.trim() || isGenerating}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating
                  ? "Generating Flashcards..."
                  : "Generate Flashcards"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Flashcards: {topic}
                </h3>
                
                {!isSavedSet && (
                  <div className="flex justify-center space-x-2 mt-4">
                    <button
                            onClick={handleSaveFlashcards}
                            disabled={planType === "FREE"}
                            className={`flex items-center text-sm ${
                              planType === "FREE"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-purple-600 hover:text-purple-700"
                            }`}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save 
                          </button>
                    <button
                      onClick={handleGenerateNewSet}
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Generate New Set
                    </button>
                      <button
      onClick={handleCloseFlashcards}
      className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
    >
      <X className="w-6 h-6" />
    </button>
                  </div>
                )}
              
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 text-center min-h-48 flex items-center justify-center">
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-4">
                    {showAnswer
                      ? flashcards[currentCard].back
                      : flashcards[currentCard].front}
                  </p>
                  <button
                    onClick={handleShowAnswer}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {showAnswer ? "Show Question" : "Show Answer"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentCard === 0}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentCard === flashcards.length - 1}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
              <span className="text-sm text-gray-500">
                  {currentCard + 1} / {flashcards.length}
                </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsTool;
