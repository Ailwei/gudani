"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Menu, X } from "lucide-react";
import ChatHistory from "./chatHistory";
import { Send } from "lucide-react";


interface UserSelection {
  grade: string;
  subject: string;
}

function highlightAIText(text: string) {
  text = text.replace(
    /(^|\n)([A-Z][^:\n]{2,}):/g,
    '$1<span class="font-bold text-purple-700">$2:</span>'
  );
  text = text.replace(
    /([A-Za-z]\s*=\s*[A-Za-z0-9×\/*\+\-\s]+)/g,
    '<span class="bg-yellow-100 px-1 rounded">$1</span>'
  );
  text = text.replace(
    /(\n|^)[*-]\s*(.*)/g,
    '$1<span class="text-purple-600">•</span> <span class="">{2}</span>'
  );
  text = text.replace(
    /(e\.g\.,|for example,)/gi,
    '<span class="italic text-blue-700">$1</span>'
  );
  return text;
}

const AIChatTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: `Hi! I'm ready to help you with ${selection.subject} for ${selection.grade}. What would you like to learn about?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!selectedChatId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/chatMessages`, {
          params: { chatId: selectedChatId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.messages) {
          const mapped = res.data.messages.map((m: any) => ({
            type: m.role === "user" ? "user" : "ai",
            content: m.content,
          }));
          setMessages(mapped);
          setChatId(selectedChatId);
        }
      } catch (err) {
        console.error("Error fetching chat messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: inputMessage }]);
    setLoading(true);

    try {
      const prompt = `Grade: ${selection.grade}\nSubject: ${selection.subject}\nQuestion: ${inputMessage}`;
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/chatBot",
        {
          prompt,
          grade: selection.grade,
          subject: selection.subject,
          useSyllabus: true,
          chatId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.chat?.id && !chatId) {
        setChatId(res.data.chat.id);
      }

      let aiContent =
        res.data?.response && typeof res.data.response === "string"
          ? res.data.response
          : "Sorry, I couldn't find an answer.";

      aiContent = aiContent
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\n{2,}/g, "\n\n");

      setMessages((prev) => [...prev, { type: "ai", content: aiContent }]);
    } catch (err: any) {
      let errorMsg = "Error: Unable to get response from AI.";

      if (err.response?.status === 403 && err.response?.data?.error) {
        errorMsg = `Error: ${err.response.data.error}`;
      }

      setMessages((prev) => [...prev, { type: "ai", content: errorMsg }]);
    } finally {
      setLoading(false);
      setInputMessage("");
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);
  };

  return (
<div className="flex  flex-col md:flex-row gap-1 bg-white">
      <div className="hidden md:block w-64 border-r border-gray-200">
        <ChatHistory onSelectChat={handleSelectChat} />
      </div>
     
      {sidebarOpen && (
        <div className="fixed inseat-0 z-40 flex">
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
            <ChatHistory onSelectChat={handleSelectChat} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden text-gray-600"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-xl md:text font-bold text-gray-900">Study Bot</h2>
                    <p className="text-gray-600 text-sm md:text-base">
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
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  message.type === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p
                  className="text-sm whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: highlightAIText(
                      message.content
                        .replace(/Grade:.*\nSubject:.*\nQuestion:/g, "")
                        .trim()
                    ),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 md:p-6 border-t border-gray-200">
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      placeholder="Ask your question..."
      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 
                 focus:outline-none focus:ring-2 focus:ring-purple-500 
                 text-gray-900 font-normal"
      onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
      disabled={loading}
    />
   <button
  onClick={sendMessage}
  className="rounded-lg bg-purple-600 text-white p-2 sm:p-3
             hover:bg-purple-700 transition-colors 
             flex items-center justify-center"
  disabled={loading}
>
  {loading ? (
    <span className="animate-pulse">...</span>
  ) : (
    <Send className="w-5 h-5" />
  )}
</button>

  </div>
</div>

      </div>
    </div>
  );
};

export default AIChatTool;
