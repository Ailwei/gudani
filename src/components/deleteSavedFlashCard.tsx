import React from "react";
import axios from "axios";



interface deleteFlasCardProps {
    setId: string,
    onDelete: () => void;
    className?: string
}

const DeleteFlashCard: React.FC<deleteFlasCardProps> = ({ setId, onDelete, className }) => {

    const handleDeleteFashCard = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("no token found , try login again")
            }
            const res = await axios.delete("api/deleteSavedFlashCard", {
                data: {
                    setId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                onDelete();
            }

        } catch (error) {
            alert("Error deleting flashcard");
        }
    };
    return (
         <span
      onClick={handleDeleteFashCard}
      className={`block w-full px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-100 hover:text-red-600 ${className}`}
    >
      Delete
    </span>
    );
};

export default DeleteFlashCard;