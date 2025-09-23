import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const userData = verifyToken(token);
  if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = await req.json();
  if (!paymentMethodId) return NextResponse.json({ error: "paymentMethodId is required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: userData.userId } });
  if (!user?.stripeCustomerId) return NextResponse.json({ error: "Stripe customer not found" }, { status: 404 });

  await stripe.paymentMethods.detach(paymentMethodId);

  return NextResponse.json({ success: true, message: "Card removed" });
}
