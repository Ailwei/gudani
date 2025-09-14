import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteChat from "./deleteChat";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

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
        const res = await axios.get("/api/chatHistory", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
            className="group flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100">

            <button
              onClick={() => onSelectChat(chat.id)}
              className="flex-1 text-left text-gray-900 truncate"
            >
              {chat.title}
            </button>
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
                <Menu.Item>
                <Menu.Item>
  {({ active }) => (
    <DeleteChat
      chatId={chat.id}
      onDeleted={() => handleDeleteFromUI(chat.id)}
      className={`${
        active ? "bg-red-100 text-red-600" : "text-red-500"
      } w-full px-4 py-2 text-sm text-left`}
    />
  )}
</Menu.Item>

                </Menu.Item>
              </Menu.Items>
              </Menu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
