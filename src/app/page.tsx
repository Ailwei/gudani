"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Zap, BookOpen, Target, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const StudySmartAILanding: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const featuresRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const pricingRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const aboutRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Study Bot",
      description: "Get instant, easy-to-understand answers to any subject question",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "Smart Summaries",
      description: "Upload notes and get simplified summaries for better revision",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Quiz Generator",
      description: "Create personalized MCQs for self-testing and practice",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: Zap,
      title: "Smart Flashcards",
      description: "Generate flashcards from your notes for active recall learning",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => window.location.href = "/"}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GudaniSmartAI
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                className="text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => scrollToSection(featuresRef)}
                type="button"
              >
                Features
              </button>
              <button
                className="text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => scrollToSection(pricingRef)}
                type="button"
              >
                Pricing
              </button>
              <button
                className="text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => scrollToSection(aboutRef)}
                type="button"
              >
                About
              </button>
              <button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => window.location.href = "/register"}
              >
                Get Started
              </button>
              <button
                className="bg-white text-purple-600 px-6 py-2 rounded-xl font-semibold border border-purple-200 hover:bg-purple-50 transition-all duration-300"
                onClick={() => window.location.href = "/login"}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-8 animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              Smarter Learning Starts Here
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Unlock Your Potential
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                GudaniSmartAI
              </span>
            </h1>
            <p className="text-2xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
              The AI-powered study companion for high school students. Get instant answers, smart quizzes, and easy summaries—so you can learn faster and achieve more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center">
                Start Learning Free
                <ArrowRight className="ml-3 w-6 h-6" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl text-xl font-bold hover:border-purple-600 hover:text-purple-600 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>
      <section ref={aboutRef} className="py-20 bg-gradient-to-br from-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About           GudaniSmartAI
</h2>
          <p className="text-xl text-gray-700 mb-8">
            GudaniSmartAI is your personal AI-powered study assistant, designed for high school learners.
            We believe every student deserves access to smart, personalized learning tools that make studying easier, faster, and more effective.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col items-center">
              <span className="text-purple-700 text-3xl font-bold mb-2">Curriculum-Aligned</span>
              <p className="text-gray-600 text-sm text-center">
                Supports South African CAPS, IEB, and Cambridge (coming soon). Content is tailored to your grade and subject for maximum relevance.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col items-center">
              <span className="text-purple-700 text-3xl font-bold mb-2">For Learners</span>
              <p className="text-gray-600 text-sm text-center">
                Built for students. Use StudySmartAI for homework help, revision, lesson planning, or extra support.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col items-center">
              <span className="text-purple-700 text-3xl font-bold mb-2">AI-Powered Tools</span>
              <p className="text-gray-600 text-sm text-center">
                Get instant answers, smart quizzes, flashcards, and note summaries. Our AI adapts to your grade level and learning needs.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Our Mission</h3>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              To make high-quality, personalized learning accessible to every student. 
              We use the latest AI technology to simplify complex topics, boost confidence, and help you achieve your best results.
            </p>
          </div>
        </div>
      </section>
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Tools for Every Subject
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four core features designed to revolutionize how you study, practice, and master your coursework.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`p-8 rounded-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                    activeFeature === index
                      ? 'bg-gradient-to-br from-white to-purple-50 shadow-2xl border-2 border-purple-200'
                      : 'bg-white hover:shadow-xl border-2 border-gray-100'
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 mx-auto transition-transform duration-300 ${
                    activeFeature === index ? 'scale-110' : ''
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={pricingRef} className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Learning Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you're ready to unlock your full potential
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Freemium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">R0<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-8">
                {[
                  "5 AI questions per day",
                  "Basic flashcards",
                  "Simple quizzes",
                  "Note summaries (limited)"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Get Started Free
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Standard</h3>
              <div className="text-4xl font-bold mb-6">R29<span className="text-lg opacity-75">/month</span></div>
              <ul className="space-y-3 mb-8">
                {[
                  "Limited flashcards, quizzes, and summaries",
                  "More AI questions per day",
                  "Progress tracking",
                  "Grade-specific content"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Start Standard
              </button>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">R99<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited flashcards, quizzes, and summaries",
                  "Unlimited AI questions",
                  "Advanced features",
                  "Priority support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold opacity-60 cursor-not-allowed"
                disabled
              >
                Start Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-purple-100 mb-8 font-medium">
            Join thousands of students already studying smarter with AI.
          </p>
          <div className="flex justify-center">
            <button className="bg-white text-purple-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Start Free Today
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold">StudySmartAI</span>
              </div>
              <p className="text-gray-400">
                Empowering high school students with AI-powered learning tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudySmartAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudySmartAILanding;