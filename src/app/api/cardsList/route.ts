import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { verifyToken } from "@/utils/veriffyToken";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const tokenData = verifyToken(token);

  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: tokenData.userId },
  });

  if (!user || !user.paystackCustomerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.paystackCustomerId,
    type: "card",
  });
console.log(paymentMethods)
  return NextResponse.json({ cards: paymentMethods.data });
}
