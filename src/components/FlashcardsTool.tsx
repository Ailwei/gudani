import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface UserSelection {
  grade: string;
  subject: string;
}

const FlashcardsTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateFlashcards = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setFlashcards([
        { front: `${topic} - Question 1`, back: `Answer tailored for ${selection.grade} level` },
        { front: `${topic} - Question 2`, back: `Another answer for ${selection.grade}` }
      ]);
      setCurrentCard(0);
      setShowAnswer(false);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          <button onClick={onBack} className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Tools
          </button>
        </div>
        <p className="text-gray-600">{selection.grade} • {selection.subject}</p>
      </div>

      <div className="p-6 space-y-6">
        {flashcards.length === 0 ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What topic would you like flashcards for?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Chemical Bonding, Poetry Analysis, etc."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-normal"
              />
            </div>

            <button
              onClick={generateFlashcards}
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating Flashcards...' : 'Generate Flashcards'}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Flashcards: {topic}</h3>
              <span className="text-sm text-gray-500">
                {currentCard + 1} / {flashcards.length}
              </span>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 text-center min-h-48 flex items-center justify-center">
              <div>
                <p className="text-lg font-medium text-gray-900 mb-4">
                  {showAnswer ? flashcards[currentCard].back : flashcards[currentCard].front}
                </p>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showAnswer ? 'Show Question' : 'Show Answer'}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
                disabled={currentCard === 0}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1))}
                disabled={currentCard === flashcards.length - 1}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>

            <div className="flex justify-center space-x-2">
              <button className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                <Save className="w-4 h-4 mr-1" />
                Save Set
              </button>
              <button 
                onClick={() => setFlashcards([])}
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                Generate New Set
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsTool;