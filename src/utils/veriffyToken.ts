import jwt from "jsonwebtoken";

export function verifyToken(
  token: string
): { userId: string; email: string; userRole: string } | null {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { userId: string; email: string; userRole: string };
    console.log(payload);
    return {
      userId: payload.userId,
      email: payload.email,
      userRole: payload.userRole,
    };
  } catch {
    return null;
  }
}
