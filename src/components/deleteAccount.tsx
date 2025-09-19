import axios from "axios";
import React from "react";


interface deleteAccountProps {
  onDelete?: () => void;
}

const DeleteAccount: React.FC<deleteAccountProps> = ({onDelete}) => {
  
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if(!token) {
        alert("No token found , Please login again");
        return
      }
      const res = await axios.delete(`api/auth/deleteAccount`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      localStorage.removeItem("token");
      alert("Account sucessfully deleted !")
      onDelete?.();
    }catch(error) {
       console.error("Error deleting account:", error);
      alert("Failed to delete account.");

    }
  };

  return (<button 
  className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
 onClick={handleDelete}>Delete Account</button>);
}

export default DeleteAccount
