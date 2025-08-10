import React from 'react';
import { Brain, BookOpen, Target, Zap } from 'lucide-react';

interface UserSelection {
  grade: string;
  subject: string;
}

const ToolSelector: React.FC<{
  selection: UserSelection;
  onToolSelect: (tool: string) => void;
  disabled: boolean;
}> = ({ selection, onToolSelect, disabled }) => {
  const tools = [
    {
      id: 'chat',
      icon: Brain,
      title: 'AI Study Bot',
      description: 'Ask subject/topic questions and get grade-specific answers',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      id: 'upload',
      icon: BookOpen,
      title: 'Note Upload + Summary',
      description: 'Upload or paste notes, get simplified summary by grade level',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: 'quiz',
      icon: Target,
      title: 'Quiz Generator',
      description: 'Create MCQs from topic input based on your grade and subject',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      id: 'flashcards',
      icon: Zap,
      title: 'Flashcards',
      description: 'Generate flashcards from notes or topics per grade',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Study Tool</h2>
      <p className="text-gray-600 mb-6">
        {selection.grade && selection.subject 
          ? `Ready to study ${selection.subject} for ${selection.grade}`
          : 'Please select your grade and subject first'
        }
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              disabled={disabled}
              className={`p-6 text-left rounded-xl border-2 transition-all duration-200 ${
                disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' 
                  : `${tool.bgColor} ${tool.borderColor} hover:scale-105 hover:shadow-md`
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToolSelector;