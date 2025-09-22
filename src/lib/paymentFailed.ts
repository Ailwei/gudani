import { sendEmail } from "@/utils/emailService";
import { user, PlanConfig } from "../generated/prisma";
import Stripe from "stripe";



export async function sendPaymentFailed(user: user, plan: PlanConfig, invoice: Stripe.Invoice) {
  return sendEmail(
    user.email!,
    "Payment Failed - GudaniSmartAI",
    `
      <h2>⚠️ Payment Failed</h2>
      <p>Hi ${user.firstName || "there"},</p>
      <p>We could not process your payment for the <strong>${plan.type}</strong> plan.</p>
      <p><strong>Amount:</strong> ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency?.toUpperCase()}</p>
      <p>Please update your payment method to avoid service interruption.</p>
      <p>🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Update Payment Method</a></p>
    `
  );
}
