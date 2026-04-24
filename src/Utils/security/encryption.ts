import crypto from "node:crypto";
import { ENCRYPTION_SECRET } from "../../config/config.service.js";

const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = ENCRYPTION_SECRET;

export const encrypt = async (text: string): Promise<string> => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_SECRET_KEY),
    iv,
  );

  let encryptedData = cipher.update(text, "utf8", "hex");

  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypt = async (encryptedData: string):Promise<string> => {
  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format");
  }
  
  const [iv, encryptedText] = parts;
  
  if (!iv || !encryptedText) {
    throw new Error("Invalid encrypted data format");
  }

  const binaryLike = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    binaryLike,
  );

  let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
};
