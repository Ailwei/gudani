import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { registerSchema } from "@/schemas/auth";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { 
        firstName, 
        lastName, 
        email, 
        password: hashedPassword,
        userRole: "USER"
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}