import { create } from "zustand";
import axios from "axios";

interface UserState {
  firstName: string;
  lastName: string;
  email?: string;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
  fetchUser: (token: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  firstName: "",
  lastName: "",
  email: "",
  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () => set({ firstName: "", lastName: "", email: "" }),
  fetchUser: async (token: string) => {
    try {
      const res = await axios.get("/api/auth/userDetails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({ ...state, ...res.data }));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  },
}));
