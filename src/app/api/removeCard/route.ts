import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";
import axios from "axios";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const userData = await verifyToken(token);
  if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = await req.json();
  if (!paymentMethodId)
    return NextResponse.json({ error: "paymentMethodId is required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: userData.userId } });
  
  if (!user?.paystackCustomerId)
    return NextResponse.json({ error: "Paystack customer not found" }, { status: 404 });

  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

    const authRes = await axios.get(
  `https://api.paystack.co/customer/${user.paystackCustomerId}`,
  {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  }
);

    const authorizations = authRes.data.data.authorizations || [];
    const authorization = authorizations.find((a: any) => a.authorization_code === paymentMethodId);

    if (!authorization) {
      return NextResponse.json({ error: "Card not found for this customer" }, { status: 404 });
    }

    const res = await axios.post(
  "https://api.paystack.co/transaction/authorization/deactivate",
  { authorization_code: paymentMethodId },
  {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  }
);

    return NextResponse.json({ success: true, message: "Card removed" });
  } catch (error: any) {
    console.error("Paystack remove card error:", error.response?.data || error.message);
   
     return NextResponse.json(
      { error: "Failed to remove card.", details: error.message },
      { status: 500 }
    );
  }
}
