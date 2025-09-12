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
      console.log("Account deleted: ", res.data)

      localStorage.removeItem("token");

      alert("Account sucessfully deleted !")
      onDelete?.();
      
    }catch(error) {
       console.error("Error deleting account:", error);
      alert("Failed to delete account.");

    }
  };

  return <button onClick={handleDelete}>Delete Account</button>;
}

export default DeleteAccount
