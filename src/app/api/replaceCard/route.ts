import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { card } = body; // card object with number, exp_month, exp_year, cvc (if you want to tokenize)

    let dbUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let customerId = dbUser.paystackCustomerId;

    // Create Paystack customer if it doesn't exist
    if (!customerId) {
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
      const response = await axios.post(
        "https://api.paystack.co/customer",
        {
          email: dbUser.email,
          first_name: dbUser.firstName,
          last_name: dbUser.lastName,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      customerId = response.data.data.id;

      await db.user.update({
        where: { id: user.userId },
        data: { paystackCustomerId: customerId },
      });
    }
    return NextResponse.json({
      success: true,
      message: "Paystack customer ready",
      paystackCustomerId: customerId,
    });
  } catch (err: any) {
    console.error("Paystack card management error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
