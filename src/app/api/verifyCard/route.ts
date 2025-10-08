import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/veriffyToken";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = verifyRes.data.data;
    if (!data || data.status !== "success") {
      return NextResponse.json({ error: "Transaction not successful" }, { status: 400 });
    }

    const card = data.authorization;
    if (!card || !card.authorization_code) {
      return NextResponse.json({ error: "No card authorization found" }, { status: 400 });
    }

    return NextResponse.json({ success: true, authorizationCode: card.authorization_code });
  } catch (err: any) {
    console.error("verifyCard error:", err.response?.data || err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}