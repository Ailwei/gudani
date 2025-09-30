import { sendEmail } from "@/utils/emailService";
import { user, PlanConfig, Subscription } from "../generated/prisma";

export async function sendSubscriptionCancelled(
  user: user,
  plan: PlanConfig,
  subscription: Subscription,
  type: "scheduled" | "immediate" = "scheduled"
) {
  // Use the subscription.endDate if scheduled, or today if immediate
  const endDate =
    type === "scheduled" && subscription.endDate
      ? subscription.endDate
      : new Date();

  const message =
    type === "scheduled"
      ? `<p>Your <strong>${plan.type}</strong> plan has been <strong>scheduled for cancellation</strong>.</p>
         <p>You will still have access until <strong>${endDate.toDateString()}</strong>.</p>`
      : `<p>Your <strong>${plan.type}</strong> plan has been <strong>cancelled immediately</strong>.</p>
         <p>You no longer have access as of <strong>${endDate.toDateString()}</strong>.</p>`;

  return sendEmail(
    user.email!,
    "Subscription Cancelled - GudaniSmartAI",
    `
      <h2>Subscription Cancelled</h2>
      <p>Hi ${user.firstName || "there"},</p>
      ${message}
    `
  );
}
