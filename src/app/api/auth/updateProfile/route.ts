import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Missing auth token." }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token." }, { status: 401 });

    const body = await request.json();
    const { firstName, lastName, email } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, or email." },
        { status: 400 }
      );
    }
    const fullName = `${firstName} ${lastName}`;

    const updatedUser = await db.user.update({
      where: { id: user.userId },
      data: { firstName, lastName, email },
      select: { id: true, firstName: true, lastName: true, email: true, paystackCustomerId: true },
    });

    if (updatedUser.paystackCustomerId) {
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
      await axios({
        method: "put",
        url: `https://api.paystack.co/customer/${updatedUser.paystackCustomerId}`,
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        data: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      });
    }
    return NextResponse.json({ user: updatedUser, message: "Profile updated successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile.", details: error.message },
      { status: 500 }
    );
  }
}
