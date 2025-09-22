import { user, PlanConfig, Subscription } from "../generated/prisma";
import Stripe from "stripe";
import { sendEmail } from "@/utils/emailService";

export async function sendPaymentReceipt(
  user: user,
  plan: PlanConfig,
  invoice: Stripe.Invoice
) {
  await sendEmail(
    user.email!,
    "Payment Receipt - GudaniSmartAI",
    `
      <h2>✅ Payment Successful</h2>
      <p>Hi ${user.firstName || "there"},</p>
      <p>Your payment for the <strong>${plan.type}</strong> plan has been received.</p>
      <p><strong>Amount:</strong> ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency?.toUpperCase()}</p>
      <p><strong>Date:</strong> ${new Date(invoice.created * 1000).toLocaleDateString()}</p>
      <p>🔗 <a href="${invoice.hosted_invoice_url}">Download your official invoice</a></p>
    `
  );
}
