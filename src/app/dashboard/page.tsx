"use client";
import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import axios from 'axios';

import Header from '@/components/Header';
import GradeSubjectSelector from '../../components/GradeSubjectSelector';
import ToolSelector from '@/components/ToolSelector';
import Footer from '@/components/Footer';
import AdminDashboard from '../adminDashboard/page';
import PlanSelector from '@/components/PlanSelector';
import SettingsPage from '@/components/settings';

import dynamic from "next/dynamic";

const AIChatTool = dynamic(() => import('@/components/AIChatTool'), { ssr: false });
const NoteUploadTool = dynamic(() => import('@/components/NoteUploadTool'), { ssr: false });
const QuizGeneratorTool = dynamic(() => import('@/components/QuizGeneratorTool'), { ssr: false });
const FlashcardsTool = dynamic(() => import('@/components/FlashcardsTool'), { ssr: false });
const RecentActivity = dynamic(() => import('@/components/RecentActivity'), { ssr: false });


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
  const [showPlans, setShowPlans] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
            if (res.status === 200 && res.data) {
              setUserRole(res.data.userRole === "ADMIN" ? "ADMIN" : "USER");
              setUserId(res.data.id);
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
    if (showSettings) return <SettingsPage onClose={() => setShowSettings(false)}/>;

    if (!isSelectionComplete || !activeTool) {
      return (
<div className="flex flex-col space-y-6">
          <div className="flex-1">
            <GradeSubjectSelector selection={selection} onSelectionChange={setSelection} />
          </div>
          <div className="flex-1">
            <ToolSelector
              selection={selection}
              onToolSelect={setActiveTool}
              disabled={!isSelectionComplete}
            />
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex flex-col">
      <Header
        variant="dashboard"
        onUpgradeClick={() => setShowPlans(true)}
        onSettingsClick={() => setShowSettings(prev => !prev)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
        {showPlans && userId ? (
          <PlanSelector userId={userId} onClose={() => setShowPlans(false)} />
        ) : (
          <>
            {renderContent()}
            <RecentActivity />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudySmartDashboard;
