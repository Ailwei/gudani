import React, { useEffect, useState } from "react";
import { Brain, SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  variant?: "dashboard" | "landing";
  isLoggedIn?: boolean;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({
  variant = "landing",
  isLoggedIn = false,
  userName,
}) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>(
    userName || localStorage.getItem("userName") || ""
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchUserName() {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/auth/userDetails", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted) {
              const fullName = data.firstName
                ? `${data.firstName} ${data.lastName}`
                : "";
              setDisplayName(fullName);
              if (fullName) localStorage.setItem("userName", fullName);
            }
            return;
          } else {
            console.error("Failed to fetch user details:", res.statusText);
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
      }
      
      if (isMounted) {
        const storedName = localStorage.getItem("userName");
        setDisplayName(userName || storedName || "");
      }
    }

    fetchUserName();

    return () => {
      isMounted = false;
    };
  }, [userName]);

  const handleLogoClick = () => {
    if (isLoggedIn) {
      if (window.location.pathname === "/dashboard") {
        window.location.reload();
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      router.push("/login");
    }
  };


  if (variant === "dashboard") {
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StudySmartAI
              </h1>
              <p className="text-sm text-gray-600">
                AI Study Assistant for Grades 8-12
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {displayName || (
                  <span className="text-gray-400 animate-pulse">...</span>
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StudySmartAI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              About
            </a>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
