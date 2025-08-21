import React, { useState } from 'react';
import { Save } from 'lucide-react';
import axios from 'axios';

interface UserSelection {
  grade: string;
  subject: string;
}

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  diagram?: string | null;
}

interface QuizData {
  topic: string;
  grade: string;
  subject: string;
  questions: Question[];
}

const QuizGeneratorTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateQuiz = async () => {
    setIsGenerating(true);
    setShowResults(false);
    setSelectedAnswers({});
    setErrorMessage(null);
    setQuiz(null);

    try {
      const res = await axios.post('/api/createQuiz', {
        grade: selection.grade,
        subject: selection.subject,
        topic
      });

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

  const handleSubmitAnswers = () => {
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Quiz Generator</h2>
          <button onClick={onBack} className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Tools
          </button>
        </div>
        <p className="text-gray-600">{selection.grade} • {selection.subject}</p>
      </div>

      <div className="p-6 space-y-6">
        {errorMessage && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What topic would you like to be quizzed on?
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
          onClick={generateQuiz}
          disabled={!topic.trim() || isGenerating}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating Quiz...' : 'Create MCQ Quiz'}
        </button>

        {quiz && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quiz: {quiz.topic}</h3>
              <button className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                <Save className="w-4 h-4 mr-1" />
                Save Quiz
              </button>
            </div>

            {quiz.questions.map((q, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-medium text-gray-900 mb-3">
                  {index + 1}. {q.question}
                </p>
                {q.diagram && (
                  <img src={q.diagram} alt="diagram" className="mb-3 max-h-48 object-contain" />
                )}
                <div className="space-y-2">
                  {q.options.map((option, optIndex) => {
                    const isSelected = selectedAnswers[index] === option;
                    const isCorrect = showResults && option === q.correct;
                    const isWrong = showResults && isSelected && option !== q.correct;

                    return (
                      <label
                        key={optIndex}
                        className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${
                          isCorrect ? 'bg-green-100' :
                          isWrong ? 'bg-red-100' : 'bg-white'
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
  );
};

export default QuizGeneratorTool;
