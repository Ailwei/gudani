import React, { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface Quiz {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  questions: Question[];
}

interface QuizListProps {
  onSelectQuiz: (quiz: Quiz) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onSelectQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await axios.get("/api/getQuizes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }
    };

    fetchQuizzes();
  }, []);

 return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Saved Quizes</h2>
            <div className="flex-1 overflow-y-auto space-y-2">

    {quizzes.length === 0 && <p className="text-gray-500">No quizzes saved yet.</p>}
    {quizzes.map((quiz) => (
      <button
        key={quiz.id}
        onClick={() => {
          onSelectQuiz(quiz);
          setSelectedId(quiz.id);
        }}
        className={`block w-full text-left px-3 py-2 rounded text-gray-900 ${
          selectedId === quiz.id ? "bg-gray-200" : "hover:bg-gray-200"
        }`}
      >
        {quiz.topic}
      </button>
    ))}
  </div>
  </div>
);

};

export default QuizList;
