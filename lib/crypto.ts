import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
const IV_LENGTH = 12;

export const hasEncryptionKey = (): boolean => Boolean(ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 16);

export const encryptText = (text: string): string => {
  if (!hasEncryptionKey()) {
    // Return plain text for development without encryption key
    return text;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptText = (encryptedText: string): string => {
  if (!hasEncryptionKey()) {
    // Return plain text for development without encryption key
    return encryptedText;
  }

  const [ivPart, tagPart, dataPart] = encryptedText.split(":");
  if (!ivPart || !tagPart || !dataPart) {
    // If it's not in encrypted format, return as-is (might be plain text)
    return encryptedText;
  }

  const iv = Buffer.from(ivPart, "base64");
  const tag = Buffer.from(tagPart, "base64");
  const data = Buffer.from(dataPart, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
};

export const decryptTextSafe = (encryptedText: string): string => {
  if (!encryptedText) {
    return "";
  }

  if (!hasEncryptionKey() || !encryptedText.includes(":")) {
    return encryptedText;
  }

  try {
    return decryptText(encryptedText);
  } catch {
    return encryptedText;
  }
};
