import {create} from "zustand";

interface UserState {
  firstName: string;
  lastName: string;
  email?: string;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void; // ← add this
}

export const useUserStore = create<UserState>((set) => ({
  firstName: "",
  lastName: "",
  email: "",
  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () => set({ firstName: "", lastName: "", email: "" }), // ← implement reset
}));
