import { sendEmail } from "@/utils/emailService";

export async function sendResetEmail(to: string, resetLink: string) {
  return sendEmail(
    to,
    "Password Reset Request",
    `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
  );
}
