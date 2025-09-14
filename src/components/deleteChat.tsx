import React from "react";
import axios from "axios";

interface DeleteChatProps {
  chatId: string;
  onDeleted: () => void;
  className?: string;

}

const DeleteChat: React.FC<DeleteChatProps> = ({ chatId, onDeleted, className }) => {
  const handleDeleteChat = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token missing, please log in again");
        return;
      }

      const res = await axios.delete("/api/deleteChatHistory", {
        data: { chatId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        onDeleted();
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  return (
     <span
      onClick={handleDeleteChat}
      className={`block w-full px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-100 hover:text-red-600 ${className}`}
    >
      Delete
    </span>
  );
};

export default DeleteChat;
