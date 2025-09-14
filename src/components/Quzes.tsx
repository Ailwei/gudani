import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteQuiz from "./deleteSavedQuiz";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

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

  const deleteQuiz = (quizId : string) => {
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
  };
  

 return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Saved Quizes</h2>
            <div className="flex-1 overflow-y-auto space-y-2">

    {quizzes.length === 0 && <p className="text-gray-500">No quizzes saved yet.</p>}
    {quizzes.map((quiz) => (
      <div
              key={quiz.id}

      className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-200"
      >
      <button
        
        onClick={() => {
          onSelectQuiz(quiz);
          setSelectedId(quiz.id);
        }}
                    className="flex-1 text-left text-gray-900 truncate"

      >
        {quiz.topic}
      </button>
      <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
    <Menu.Item>
      {({ active }) => (
        <DeleteQuiz 
      quizId={quiz.id}
      onDelete={() => deleteQuiz(quiz.id)}
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
)}

export default QuizList;
