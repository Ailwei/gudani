import jwt from "jsonwebtoken";

export function verifyToken(token: string): { userId: string, email: string } | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string, email: string };
    return payload;
  } catch {
    return null;
  }
}
