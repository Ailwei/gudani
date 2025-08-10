import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface UserSelection {
  grade: string;
  subject: string;
}

const QuizGeneratorTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = () => {
    setIsGenerating(true);
    // Simulate quiz generation
    setTimeout(() => {
      setQuiz({
        topic,
        questions: [
          {
            question: `Sample ${selection.subject} question for ${selection.grade} about ${topic}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: 0
          }
        ]
      });
      setIsGenerating(false);
    }, 2000);
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What topic would you like to be quizzed on?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Quadratic Equations, Photosynthesis, etc."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-3">{quiz.questions[0].question}</p>
              <div className="space-y-2">
                {quiz.questions[0].options.map((option: string, index: number) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="answer" className="text-purple-600" />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Submit Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGeneratorTool;