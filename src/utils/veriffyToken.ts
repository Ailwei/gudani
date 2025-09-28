import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  userRole: string;
  exp: number;
}

export function verifyToken(
  token: string
): { userId: string; email: string; userRole: string; expiresAt: number } | null {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "JWT_SECRET"
    ) as TokenPayload;

    return {
      userId: payload.userId,
      email: payload.email,
      userRole: payload.userRole,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}
