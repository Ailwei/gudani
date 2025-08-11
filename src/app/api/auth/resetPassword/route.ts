import { resetPasswordSchema } from "@/schemas/auth";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/middleWare";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, confirmPassword, token } = body;

    try {
      resetPasswordSchema.parse({ password, confirmPassword });
    } catch (zodError: any) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details:
            "Password must be at least 8 characters, include uppercase, lowercase, number, and special character. " +
            zodError.errors.map((e: any) => e.message).join(" | "),
        },
        { status: 400 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: Number(payload.userId) } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

