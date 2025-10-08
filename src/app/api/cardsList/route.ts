import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";
import axios from "axios";

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
    return NextResponse.json({ error: "User not found or missing Paystack customer ID" }, { status: 404 });
  }

  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
    const response = await axios.get(
      `https://api.paystack.co/customer/${user.paystackCustomerId}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

   const cards = response.data.data?.authorizations || [];
   return NextResponse.json({ cards });
   
  } catch (error: any) {
    console.error("Paystack fetch cards error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch cards.", details: error.message },
      { status: 500 }
    );
  }
}