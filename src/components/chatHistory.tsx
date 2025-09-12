import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteChat from "./deleteChat";

interface ChatSummary {
  id: string;
  title: string;
}

interface Props {
  onSelectChat: (chatId: string) => void;
}

const ChatHistory: React.FC<Props> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<ChatSummary[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching chats with token:", token);

        const res = await axios.get("/api/chatHistory", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API response:", res.data);

        if (res.data.chats) {
          setChats(res.data.chats);
        } else {
          console.warn("No chats found in response");
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchChats();
  }, []);
const handleDeleteFromUI = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };
  return (
    <div className="w-64 h-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-shrink-0 flex flex-col">
      <h3 className="text-lg font-bold mb-2 text-gray-900">Chat History</h3>
      <div className="flex-1 overflow-y-auto space-y-1">
        {chats.length === 0 && <p className="text-gray-500">No chats found.</p>}
        {chats.map((chat) => (
    <div
            key={chat.id}
            className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-200"
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className="flex-1 text-left text-gray-900"
            >
              {chat.title}
            </button>
            <DeleteChat
              chatId={chat.id}
              onDeleted={() => handleDeleteFromUI(chat.id)}
            />
          </div>

        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
