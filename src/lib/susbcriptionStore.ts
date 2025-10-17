import { create } from "zustand";
import axios from "axios";
import { PlanType } from "@/components/PlanSelector";

interface SubscriptionState {
  planType: PlanType;
  setPlanType: (plan: PlanType) => void;
  fetchSubscription: (token: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  planType: PlanType.FREE,
  setPlanType: (plan) => set({ planType: plan }),
  fetchSubscription: async (token: string) => {
    try {
      const res = await axios.get("/api/subscriptionDetails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ planType: res.data.planType || PlanType.FREE });
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  },
}));
