import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import jwt from "jsonwebtoken";


export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true, userRole: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
