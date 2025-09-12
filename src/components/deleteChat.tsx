import React from "react";
import axios from "axios";

interface DeleteChatProps {
  chatId: string;
  onDeleted: () => void;
}

const DeleteChat: React.FC<DeleteChatProps> = ({ chatId, onDeleted }) => {
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
    <button
      onClick={handleDeleteChat}
      className="ml-2 text-red-600 hover:text-red-800"
    >
      Delete
    </button>
  );
};

export default DeleteChat;
