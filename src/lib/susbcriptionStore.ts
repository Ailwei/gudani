import { create } from "zustand";

interface SubscriptionState {
  planType: string;
  setPlanType: (plan: string) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  planType: "FREE",
  setPlanType: (plan) => set({ planType: plan }),
}));
