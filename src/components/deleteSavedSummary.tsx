import React from "react";
import axios from "axios";

interface deleteSummaryProps {

    summaryId: string;
    onDelete: () => void;
    className?: string;
}
const DeleteSummary: React.FC<deleteSummaryProps> = ({className, summaryId, onDelete }) => {
    const handleDeleteSummary = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("no token found , try to login again")
            }
            const res = await axios.delete("api/deleteSavedSummary", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    summaryId
                },
            })
            if (res.data.success) {
                onDelete();
            }
        } catch (error) {
            alert("Error deleting flashcard");
            console.log(error)
        }
    }
    return (
         <span
      onClick={handleDeleteSummary}
      className={`block w-full px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-100 hover:text-red-600 ${className}`}
    >
      Delete
    </span>
    )
}
export default DeleteSummary