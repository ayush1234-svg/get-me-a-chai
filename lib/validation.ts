/**
 * Validation utilities for the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.length < 3 || username.length > 20) {
    return { isValid: false, error: "Username must be between 3 and 20 characters" };
  }
  if (!/^[a-z0-9_-]{3,20}$/.test(username.toLowerCase())) {
    return {
      isValid: false,
      error: "Username can only contain lowercase letters, numbers, underscores, and hyphens",
    };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }
  return { isValid: true };
};

export const validateAmount = (amount: number | string): ValidationResult => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (!Number.isFinite(numAmount)) {
    return { isValid: false, error: "Amount must be a valid number" };
  }

  if (numAmount < 1) {
    return { isValid: false, error: "Amount must be at least ₹1" };
  }

  if (numAmount > 100000) {
    return { isValid: false, error: "Amount cannot exceed ₹100,000" };
  }

  return { isValid: true };
};

export const validateMessage = (message: string): ValidationResult => {
  if (message && message.length > 500) {
    return { isValid: false, error: "Message cannot exceed 500 characters" };
  }
  return { isValid: true };
};

export const validateRazorpayCredentials = (
  keyId: string | undefined,
  keySecret: string | undefined
): ValidationResult => {
  if (!keyId?.trim() || !keySecret?.trim()) {
    return {
      isValid: false,
      error: "Razorpay credentials are not configured. Please update your dashboard.",
    };
  }
  return { isValid: true };
};

export const validateProfileUpdate = (data: {
  name?: string;
  bio?: string;
  username?: string;
}): ValidationResult => {
  if (data.name && data.name.length > 100) {
    return { isValid: false, error: "Name cannot exceed 100 characters" };
  }

  if (data.bio && data.bio.length > 500) {
    return { isValid: false, error: "Bio cannot exceed 500 characters" };
  }

  if (data.username) {
    const validation = validateUsername(data.username);
    if (!validation.isValid) return validation;
  }

  return { isValid: true };
};
