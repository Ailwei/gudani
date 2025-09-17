import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterInput = await req.json();

    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const freePlan = await db.planConfig.findUnique({ where: { type: "FREE" } });
    if (!freePlan) {
      return NextResponse.json(
        { error: "FREE plan not configured. Please set up plans first." },
        { status: 500 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await db.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email.toLowerCase().trim(),
        password: hashedPassword,
        Subscription: {
          create: {
            planId: freePlan.id,
            status: "ACTIVE",
            startDate: new Date(),
          },
        },
      },
      include : {
        Subscription: true,
      }
    });

return NextResponse.json({ success: true, userId: user.id, email: user.email });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
