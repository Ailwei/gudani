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

    const dbUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
    const NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

    let customerCode = dbUser.paystackCustomerId;

    if (!customerCode) {
      const createCustomerRes = await axios.post(
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

      customerCode = createCustomerRes.data.data.customer_code;

      await db.user.update({
        where: { id: user.userId },
        data: { paystackCustomerId: customerCode },
      });
    }

    return NextResponse.json({
      success: true,
      email: dbUser.email,
      paystackPublicKey: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      customerCode,
    });
  } catch (err: any) {
    console.error("Paystack replace card error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}