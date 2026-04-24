import { customAlphabet } from "nanoid";

export function generateOTP() {
  return customAlphabet("0123456789", 6)();
}

export function generateOTPWithExpiration(expirationMinutes = 5) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  return { otp, expiresAt };
}
