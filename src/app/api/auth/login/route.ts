import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const Email = body.email.toLowerCase().trim();


    const user = await db.user.findUnique({ where: { email: Email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, userRole: user.userRole},
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "24h" }
    );

    return NextResponse.json(
      { message: "Login successful", userId: user.id, token, userRole: user.userRole },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}