import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import Stripe from "stripe";
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
      console.log("Stripe event received:", event.type);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    switch (event.type) {
      case "customer.subscription.created": {
        const stripeSub = event.data.object as Stripe.Subscription;
        console.log("Subscription created event received:", stripeSub.id);

        const userId = stripeSub.metadata?.userId;
        const planType = stripeSub.metadata?.planType;

        console.log("User ID:", userId, "Plan type:", planType, "Stripe Subscription ID:", stripeSub.id);

        if (!userId || !planType) {
          console.warn("Missing metadata on subscription creation");
          break;
        }

        const plan = await db.planConfig.findUnique({ where: { type: planType as any } });
        if (!plan) {
          console.warn("Plan not found for type:", planType);
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
          console.log("Subscription updated in DB for user:", userId);
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
          console.log("New subscription created in DB for user:", userId);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session object:", session);

        if (session.mode === "subscription" && session.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
          const userId = session.metadata?.userId || stripeSub.metadata.userId;
          const planType = session.metadata?.planType || stripeSub.metadata.planType;

          console.log("User ID:", userId, "Plan type:", planType, "Stripe Subscription ID:", stripeSub.id);

          if (!userId || !planType) break;

          const plan = await db.planConfig.findUnique({ where: { type: planType as any } });
          if (!plan) {
            console.warn("Plan not found for type:", planType);
            break;
          }

          const rawStart = (stripeSub as any).current_period_start;
          if (!rawStart) throw new Error("Stripe subscription missing current_period_start");
          const startDate = new Date(rawStart * 1000);

          const rawEnd = (stripeSub as any).current_period_end;
          if (!rawEnd) throw new Error("Stripe subscription missing current_period_end");

          const endDate = new Date(rawEnd * 1000);

          const existingSub = await db.subscription.findFirst({ where: { userId }, orderBy: { startDate: "desc" } });

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
            console.log("Subscription updated in DB for user:", userId);
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
            console.log("New subscription created in DB for user:", userId);
          }
        }
        break;
      }
      case "customer.subscription.updated": {
  const stripeSub = event.data.object as Stripe.Subscription;
  const existingSub = await getLatestUserSubscription(undefined, stripeSub.id);
  if (existingSub) {
    await db.subscription.update({
      where: { id: existingSub.id },
      data: {
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        cancellationDate: stripeSub.cancel_at_period_end ? new Date((stripeSub as any)["current_period_end"] * 1000) : null,
      },
    });
  }
  break;
}


      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;

        const existingSub = await getLatestUserSubscription(undefined, stripeSub.id);

        if (!existingSub) {
          console.warn("No matching subscription found for Stripe ID:", stripeSub.id);
          break;
        }
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
             cancelAtPeriodEnd: false,
             cancellationDate: null, 
          },
        });

        console.log("Subscription cancelled and downgraded for user:", existingSub.userId);
        break;
      }



      // case "invoice.payment_succeeded": {
      //   const invoice = event.data.object as Stripe.Invoice;
      //   console.log("Invoice payment succeeded event:", invoice);

      //   // @ts-expect-error Stripe types may not include 'subscription' on Invoice, but it exists in the API response
      //   const subscriptionId = typeof invoice['subscription'] === "string" ? invoice['subscription'] : null;
      //   console.log("Invoice subscription ID:", subscriptionId);

      //   if (subscriptionId) {
      //     const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      //     const existingSub = await db.subscription.findFirst({
      //       where: { stripeSubscriptionId: stripeSub.id },
      //       orderBy: { startDate: "desc" },
      //     });


      //     if (existingSub) {
      //       let rawEnd = (stripeSub as any)["current_period_end"];
      //       if (!rawEnd && typeof stripeSub.latest_invoice === "string") {
      //         const invoice = await stripe.invoices.retrieve(stripeSub.latest_invoice);
      //         rawEnd = invoice.lines?.data?.[0]?.period?.end;
      //       }
      //       const endDate = rawEnd ? new Date(rawEnd * 1000) : null;
      //       await db.subscription.update({
      //         where: { id: existingSub.id },
      //         data: {
      //           status: "ACTIVE",
      //           endDate,
      //         },
      //       });
      //       console.log("Subscription updated from invoice payment for user:", existingSub.userId);
      //     }
      //   }
      //   break;
      // }

      default:
        console.log("Unhandled Stripe event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}