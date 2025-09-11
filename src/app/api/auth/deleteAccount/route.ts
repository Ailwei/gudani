import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/veriffyToken";
import { db } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Missing auth token." }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token." }, { status: 401 });

    const body = await req.json();
    const { firstName, lastName, email } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, or email." },
        { status: 400 }
      );
    }

    const deletedUser = await db.user.delete({
      where: { email },
    });

    return NextResponse.json({ success: true, deletedUser });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
