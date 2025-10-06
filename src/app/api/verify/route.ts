// app/api/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference") || req.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.json({ status: false, message: "No reference provided" }, { status: 400 });
  }

  try {
    const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = res.data;

    // Get the absolute frontend URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (data.status && data.data.status === "success") {
      // TODO: Update user subscription in DB if needed

      return NextResponse.redirect(`${baseUrl}/verify-success`);
    }

    return NextResponse.redirect(`${baseUrl}/verify-failed`);
  } catch (err) {
    console.error("Paystack verification error:", err);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/verify-failed`);
  }
}
