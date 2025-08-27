"use client"
import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import axios from 'axios';

import Header from '@/components/Header';
import GradeSubjectSelector from '../../components/GradeSubjectSelector';
import ToolSelector from '@/components/ToolSelector';
import AIChatTool from '@/components/AIChatTool';
import NoteUploadTool from '@/components/NoteUploadTool';
import QuizGeneratorTool from '@/components/QuizGeneratorTool';
import FlashcardsTool from '@/components/FlashcardsTool';
import RecentActivity from '@/components/RecentActivity';
import Footer from '@/components/Footer';
import AdminDashboard from '../adminDashboard/page';


interface UserSelection {
  grade: string;
  subject: string;
}

const StudySmartDashboard: React.FC = () => {
  const [selection, setSelection] = useState<UserSelection>({ grade: '', subject: '' });
  const [activeTool, setActiveTool] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState<"USER" | "ADMIN" | undefined>(undefined);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    async function fetchUserRole() {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        setIsAuthChecked(true);

        if (token) {
          try {
            const res = await axios.get("/api/auth/userDetails", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200 && res.data.userRole) {
              setUserRole(res.data.userRole === "ADMIN" ? "ADMIN" : "USER");
            } else {
              setUserRole("USER");
            }
          } catch {
            setUserRole("USER");
          }
        } else {
          setUserRole("USER");
        }
        setRoleChecked(true);
      }
    }
    fetchUserRole();
  }, []);

  if (!isAuthenticated && isAuthChecked) {
    window.location.href = "/login";
    return null;
  }

  if (!roleChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            StudySmartAI
          </span>
        </div>
        <div className="text-lg text-purple-600 font-semibold animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (userRole === "ADMIN") {
    return <AdminDashboard />;
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
        return <FlashcardsTool selection={selection} onBack={() => setActiveTool('')}  />;
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