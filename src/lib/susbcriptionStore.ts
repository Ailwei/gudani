import { create } from "zustand";
import axios from "axios";
import { PlanType } from "@/components/PlanSelector";

interface Subscription {
  planType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd?: boolean;
  cancellationDate?: string | null;
  paymentStatus: "PAID" | "FAILED" | "UNPAID";
  pastDueAmount: number;
  pastDueCurrency: string | null;
}

interface SubscriptionState {
  planType: PlanType;
  subscription: Subscription | null;
  loading: boolean;
  setPlanType: (plan: PlanType) => void;
  fetchSubscription: (token: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  planType: PlanType.FREE,
  subscription: null,
  loading: true,
  setPlanType: (plan) => set({ planType: plan }),
  fetchSubscription: async (token: string) => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/subscriptionDetails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      set({
        planType: data.planType || PlanType.FREE,
        subscription: data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      set({ loading: false, subscription: null, planType: PlanType.FREE });
    }
  },
}));
