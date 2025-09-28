import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith('Bearer' )) {
      return NextResponse.json({ error: "No Token Provided" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const userDetails = verifyToken(token);

    if(!userDetails){
      return NextResponse.json({ error: "Invalid or Expired Token" }, { status: 401 });
    }
    

    const user = await db.user.findUnique({
      where: { id: userDetails.userId },
      select: { id: true, email: true, firstName: true, lastName: true, userRole: true, }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
