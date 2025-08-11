"use client"
import React, { useState, useEffect } from 'react';
import { Brain, User } from 'lucide-react';

import Header from '@/components/Header';
import GradeSubjectSelector from '../../components/GradeSubjectSelector';
import ToolSelector from '@/components/ToolSelector';
import AIChatTool from '@/components/AIChatTool';
import NoteUploadTool from '@/components/NoteUploadTool';
import QuizGeneratorTool from '@/components/QuizGeneratorTool';
import FlashcardsTool from '@/components/FlashcardsTool';
import RecentActivity from '@/components/RecentActivity';
import Footer from '@/components/Footer';

interface UserSelection {
  grade: string;
  subject: string;
}

const StudySmartDashboard: React.FC = () => {
  const [selection, setSelection] = useState<UserSelection>({ grade: '', subject: '' });
  const [activeTool, setActiveTool] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      setIsAuthChecked(true);
    }
  }, []);

  if (!isAuthenticated && isAuthChecked) {
    window.location.href = "/login";
    return null;
  }

  const isSelectionComplete = selection.grade && selection.subject;

  const renderContent = () => {
    if (!isSelectionComplete || !activeTool) {
      return (
        <div className="space-y-6">
          <GradeSubjectSelector 
            selection={selection} 
            onSelectionChange={setSelection} 
          />
          <ToolSelector 
            selection={selection}
            onToolSelect={setActiveTool}
            disabled={!isSelectionComplete}
          />
        </div>
      );
    }

    switch (activeTool) {
      case 'chat':
        return <AIChatTool selection={selection} onBack={() => setActiveTool('')} />;
      case 'upload':
        return <NoteUploadTool selection={selection} onBack={() => setActiveTool('')} />;
      case 'quiz':
        return <QuizGeneratorTool selection={selection} onBack={() => setActiveTool('')} />;
      case 'flashcards':
        return <FlashcardsTool selection={selection} onBack={() => setActiveTool('')} />;
      default:
        return <div>Tool not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Header variant="dashboard" />
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {renderContent()}
        <RecentActivity />
      </main>
      <Footer />
    </div>
  );
};

export default StudySmartDashboard;