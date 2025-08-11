import { forgotPasswordSchema } from "@/schemas/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendResetEmail } from "@/utils/emailService";
import jwt from "jsonwebtoken";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const userExists = await db.user.findUnique({
      where: { email }
    });

    if (!userExists) {
      return NextResponse.json({ error: "Email does not  Exists" }, { status: 404 });
    }

    const token = jwt.sign(
      { userId: userExists.id, email: userExists.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    const resetLink = `http://localhost:3000/resetpassword?token=${encodeURIComponent(token)}`;

    try {
      await sendResetEmail(email, resetLink);
    } catch (emailError: any) {
      return NextResponse.json({ error: "Failed to send email", details: "Check your SMTP credentials and use a Gmail App Password." }, { status: 500 });
    }

    return NextResponse.json({ message: `Password reset link sent to  ${email}`, resetLink }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}