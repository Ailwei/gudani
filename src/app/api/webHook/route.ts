import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import Stripe from "stripe";
import { sendPaymentReceipt } from "@/lib/paymentProoof";
import { sendPaymentFailed } from "@/lib/paymentFailed";
import { getLatestUserSubscription } from "@/lib/getLatestSubscription";

export const config = { api: { bodyParser: false } };

async function buffer(readable: ReadableStream<Uint8Array> | null) {
  if (!readable) return Buffer.from([]);
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

export async function POST(req: NextRequest) {
  try {
    const sigHeader = req.headers.get("stripe-signature");
    const raw = await buffer(req.body);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(raw, sigHeader ?? "", webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_intent && session.customer) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          const paymentMethodId = paymentIntent.payment_method as string;
          if (paymentMethodId) {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: session.customer as string });
            await stripe.customers.update(session.customer as string, {
              invoice_settings: { default_payment_method: paymentMethodId },
            });
          }
        }

        if (session.mode === "subscription" && session.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
          const userId = session.metadata?.userId || stripeSub.metadata.userId;
          const planType = session.metadata?.planType || stripeSub.metadata.planType;

          if (!userId || !planType) break;

          const plan = await db.planConfig.findUnique({ where: { type: planType as any } });
          if (!plan) break;

          const startDate = new Date((stripeSub as any).current_period_start * 1000);
          const endDate = new Date((stripeSub as any).current_period_end * 1000);

          const existingSub = await getLatestUserSubscription(userId, stripeSub.id);
          if (existingSub) {
            await db.subscription.update({
              where: { id: existingSub.id },
              data: { planId: plan.id, stripeSubscriptionId: stripeSub.id, status: "ACTIVE", startDate, endDate },
            });
          } else {
            await db.subscription.create({
              data: { userId, planId: plan.id, stripeSubscriptionId: stripeSub.id, status: "ACTIVE", startDate, endDate },
            });
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const stripeSub = event.data.object as Stripe.Subscription;

        const userId = stripeSub.metadata?.userId;
        const planType = stripeSub.metadata?.planType;

        if (!userId || !planType) {
          break;
        }

        const plan = await db.planConfig.findUnique({ where: { type: planType as any } });
        if (!plan) {
          break;
        }

        const rawStart = (stripeSub as any).current_period_start;
        if (!rawStart) throw new Error("Stripe subscription missing current_period_start");
        const startDate = new Date(rawStart * 1000);

        let rawEnd = (stripeSub as any).current_period_end;
        if (!rawEnd && typeof stripeSub.latest_invoice === "string") {
          const invoice = await stripe.invoices.retrieve(stripeSub.latest_invoice);
          rawEnd = invoice.lines?.data?.[0]?.period?.end;
        }
        if (!rawEnd) throw new Error("Unable to determine subscription end date");
        const endDate = new Date(rawEnd * 1000);
        const existingSub = await db.subscription.findFirst({
          where: { userId },
          orderBy: { startDate: "desc" },
        });

        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: {
              planId: plan.id,
              stripeSubscriptionId: stripeSub.id,
              status: "ACTIVE",
              startDate,
              endDate,
            },
          });
          const paymentMethodId = stripeSub.default_payment_method as string;
          if (paymentMethodId && stripeSub.customer) {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeSub.customer as string });
            await stripe.customers.update(stripeSub.customer as string, {
              invoice_settings: { default_payment_method: paymentMethodId },
            });
          }
        } else {
          await db.subscription.create({
            data: {
              userId,
              planId: plan.id,
              stripeSubscriptionId: stripeSub.id,
              status: "ACTIVE",
              startDate,
              endDate,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.userId;
        const planType = stripeSub.metadata?.planType;
        if (!userId || !planType) break;

        const plan = await db.planConfig.findUnique({ where: { type: planType as any } });
        if (!plan) break;

        const startDate = new Date((stripeSub as any).current_period_start * 1000);
        const endDate = new Date((stripeSub as any).current_period_end * 1000);

        const existingSub = await getLatestUserSubscription(userId, stripeSub.id);
        if (!existingSub) break;

        await db.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: plan.id,
            stripeSubscriptionId: stripeSub.id,
            status: "ACTIVE",
            startDate,
            endDate,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            cancellationDate: stripeSub.cancel_at_period_end ? endDate : null,
          },
        });
        const paymentMethodId = stripeSub.default_payment_method as string;
        if (paymentMethodId && stripeSub.customer) {
          await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeSub.customer as string });
          await stripe.customers.update(stripeSub.customer as string, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.userId;
        const existingSub = await getLatestUserSubscription(userId, stripeSub.id);
        if (!existingSub) break;

        const freePlan = await db.planConfig.findUnique({ where: { type: "FREE" } });
        if (!freePlan) throw new Error("Free plan not found");

        await db.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: freePlan.id,
            stripeSubscriptionId: null,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: null,
            paymentStatus: "PENDING",
            pastDueAmount: 0,
            pastDueCurrency: null,
            cancellationDate: null,
          },
        });
        break;
      }
      case "invoice.payment_succeeded": {
  const invoice = event.data.object as Stripe.Invoice;

  let subscriptionId: string | null = null;

  if (typeof invoice.subscription === "string") {
    subscriptionId = invoice.subscription;
  } else if (invoice.subscription && typeof invoice.subscription === "object") {
    subscriptionId = (invoice.subscription as Stripe.Subscription).id;
  }

  if (!subscriptionId) break;

  const sub = await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      paymentStatus: "PAID",
      pastDueAmount: 0,
      pastDueCurrency: invoice.currency?.toUpperCase() ?? null,
    },
    include :{
      user: true,
      plan: true
    }
  });
 await sendPaymentReceipt(sub.user, sub.plan, invoice);
  break;
}


      case "invoice.payment_failed": {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : null;
  if (!subscriptionId) break;

  const sub = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true, plan: true },
  });

  if (!sub) break;
  await db.subscription.update({
    where: { id: sub.id },
    data: {
      paymentStatus: "FAILED",
      pastDueAmount: invoice.amount_due / 100,
      pastDueCurrency: invoice.currency.toUpperCase(),
    },
  });

  try {
    await sendPaymentFailed(sub.user, sub.plan, invoice);
  } catch (err) {
    console.error("Failed to send email:", err);
  }

  break;
}



      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        const [firstName, ...rest] = (customer.name ?? "").split(" ");
        const lastName = rest.join(" ");
        await db.user.update({
          where: { stripeCustomerId: customer.id },
          data: { email: customer.email ?? undefined, firstName: firstName || undefined, lastName: lastName || undefined },
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
