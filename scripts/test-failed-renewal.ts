import Stripe from "stripe";
import { config } from "dotenv";

config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

async function testFailedRenewal() {
  const subscriptionId = "sub_1S4RHVRuuRix8vqusznqaIGk"; // replace with yours

  // Fetch subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("Fetched subscription:", subscription.id, subscription.status);

  // 🔥 Step 1: Create a failing test card using a token
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_chargeDeclinedInsufficientFunds" },
  });

  // 🔥 Step 2: Attach failing card
  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: subscription.customer as string,
  });

  await stripe.customers.update(subscription.customer as string, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });

  console.log("Attached failing card to customer:", paymentMethod.id);

  const invoice = await stripe.invoices.create({
    customer: subscription.customer as string,
    subscription: subscription.id,
    collection_method: "charge_automatically",
  });

  console.log("Created invoice:", invoice.id);

  if (!invoice.id) {
    throw new Error("Invoice ID is undefined.");
  }
  const paidInvoice = await stripe.invoices.pay(invoice.id, {
    expand: ["payment_intent"],
  });

  console.log("Invoice payment result:", paidInvoice.status);
}

testFailedRenewal().catch(console.error);
