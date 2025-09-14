import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import React from "react";

interface savedQuizPromps {
    quizId: string,
    onDelete: () => void;
    className?: string
}

const DeleteQuiz: React.FC<savedQuizPromps> = ({ className,quizId, onDelete }) => {
    const handleDeleteQuiz = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("no token found , Please login again")
            }
            const res = await axios.delete("api/deleteSavedQuizes", {
                data: {
                    quizId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (res.data.success) {
                onDelete();
            }

        } catch (error) {
            return NextResponse.json({
                error: "server issues"
            }, { status: 500 })
        }
    }
    return ( <span
      onClick={handleDeleteQuiz}
      className={`block w-full px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-100 hover:text-red-600 ${className}`}
    >
      Delete
    </span>
    )
}
export default DeleteQuiz