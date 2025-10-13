import React, { useEffect, useState } from "react";
import { Save, Menu, X } from "lucide-react";
import axios from "axios";
import QuizList from "./Quzes";
import Image from "next/image";
import { useSubscriptionStore } from "@/lib/susbcriptionStore";

interface UserSelection {
  grade: string;
  subject: string;
}

interface Question {
  [x: string]: any;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  diagram?: string | null;
  userAnswer?: string | null;
  quizId: string
}

interface QuizData {
  topic: string;
  grade: string;
  subject: string;
  questions: Question[];
  id?: string
}

interface Topic {
  topic: string;
  chunks: {
    name: string;
    concepts: string[];
  }[];
}


const QuizGeneratorTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const planType = useSubscriptionStore((state) => state.planType);






useEffect(() => {
  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/getTopics",
        {
          grade: selection.grade,
          subject: selection.subject
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTopics(res.data.topics);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  fetchTopics();
}, [selection.grade, selection.subject]);



 

  const generateQuiz = async (selectedTopic?: string) => {
            const topicName = selectedTopic || topic;
      
      if (!topicName) {
    setErrorMessage("Missing required fields: topic, grade, or subject.");
    return;
  }
    setIsGenerating(true);
    setShowResults(false);
    setSelectedAnswers({});
    setErrorMessage(null);
    setQuiz(null);



  const selectedTopicObj = topics.find((t) => t.topic === topicName);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/createQuiz",
        {
          grade: selection.grade,
          subject: selection.subject,
          topic:selectedTopic,
          chunks: selectedTopicObj?.chunks || [],
          useSyllabus: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuiz(res.data.quiz || null);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error generating quiz. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (qIndex: number, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitAnswers = () => setShowResults(true);
  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };
  const handleCloseQuiz = () => {
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleSaveQuiz = async () => {
  if (planType === "FREE") {
    alert("Saving quizzes is not available on the Free plan. Please upgrade to unlock this feature.");
    return;
  }

    if (!quiz) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/saveQuiz",
        {
          quizId: quiz.id,
          grade: quiz.grade,
          subject: quiz.subject,
          topic: quiz.topic,
          
          questions: quiz.questions.map((q, index) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            diagram: q.diagram || null,
            userAnswer: selectedAnswers[index] ?? null
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Quiz saved successfully!");
      handleCloseQuiz();
    } catch (err: any) {
      console.error("Save quiz error:", err.response?.data || err.message);
      alert("Failed to save quiz. Please try again.");
    }
  };

  return (
    <div className="flex h-screen gap-2">
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
            <QuizList
              onSelectQuiz={(quiz) => {
                const prefilledAnswers: { [key: number]: string } = {};
                let allAnswered = true;
                quiz.questions.forEach((q, index) => {
                  if (q.userAnswer) {
                    prefilledAnswers[index] = q.userAnswer;
                  } else {
                    allAnswered = false;
                  }
                });
                setQuiz({
                  ...quiz,
                  questions: quiz.questions.map((q) => ({
                    ...q,
                    explanation:
                      typeof q.explanation === "string"
                        ? q.explanation
                        : String(q.explanation),
                    quizId: q.quizId ?? quiz.id ?? "",
                  })),
                });
                setSelectedAnswers(prefilledAnswers)
                setSidebarOpen(false);
                setShowResults(Object.keys(prefilledAnswers).length > 0);

              }}
            />
          </div>
        </div>
      )}


      <div className="hidden md:flex w-64 border-r border-gray-200">
        <QuizList
          onSelectQuiz={(quiz) =>
            setQuiz({
              ...quiz,
              questions: quiz.questions.map((q) => ({
                ...q,
                explanation:
                  typeof q.explanation === "string"
                    ? q.explanation
                    : String(q.explanation),
                quizId: q.quizId ?? quiz.id ?? "",
              })),
            })
          }
        />
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Quiz Generator
              </h2>
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

        <div className="p-4 md:p-6 space-y-6">
          {errorMessage && (
            <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What topic would you like to be quizzed on?
              <div className="flex flex-wrap gap-2">
    {topics.map((t) => (
      <button
        key={t.topic}
        type="button"
        onClick={() => {
          setTopic(t.topic);
          generateQuiz(t.topic);
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
              placeholder="e.g., Quadratic Equations, Photosynthesis, etc."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-normal"
            />
          </div>

          <button
          key={topic}
            onClick={() => generateQuiz(topic)}
            type="button"
            disabled={!topic.trim() || isGenerating}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating Quiz..." : "Create MCQ Quiz"}
          </button>

          {quiz && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quiz: {quiz.topic}
                </h3>
                <div className="flex items-center gap-4 justify-between">
                  <button
        onClick={handleSaveQuiz}
        disabled={planType === "FREE"}
        className={`flex items-center text-sm ${
          planType === "FREE"
            ? "text-gray-400 cursor-not-allowed"
            : "text-purple-600 hover:text-purple-700"
        }`}
      >
        <Save className="w-4 h-4 mr-1" />
        Save Quiz
      </button>

                  <button onClick={handleCloseQuiz} className="text-gray-600 hover:text-gray-800">
                    <X className="w-6 h-6" />
                  </button>
                </div>

              </div>

              {quiz.questions.map((q, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-900 mb-3">
                    {index + 1}. {q.question}
                  </p>
                  {q.diagram && (
                    <Image 
                    width="44"
                    height="44"
                      src={q.diagram}
                      alt="diagram"
                      className="mb-3 max-h-48 object-contain"
                    />
                  )}
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => {
                      const isSelected = selectedAnswers[index] === option;
                      const isCorrect = showResults && option === q.correct;
                      const isWrong =
                        showResults && isSelected && option !== q.correct;

                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${isCorrect
                            ? "bg-green-100"
                            : isWrong
                              ? "bg-red-100"
                              : "bg-white"
                            }`}
                        >
                          <input
                            type="radio"
                            name={`answer-${index}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswerSelect(index, option)}
                            className="text-purple-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                  {showResults && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex space-x-4 mt-4">
                {!showResults && (
                  <button
                    onClick={handleSubmitAnswers}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Submit Answers
                  </button>
                )}
                {showResults && (
                  <button
                    onClick={handleRetakeQuiz}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGeneratorTool;
