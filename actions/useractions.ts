"use server";

import Razorpay from "razorpay";
import Payment from "@/app/models/Payment";
import User from "@/app/models/User";
import connectDb from "@/app/db/connectDb";
import type { IUser } from "@/app/models/User";
import type { IPayment } from "@/app/models/Payment";
import { validateAmount, validateProfileUpdate, validateMessage } from "@/lib/validation";
import { encryptText } from "@/lib/crypto";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const typedError = error as {
      response?: { data?: { error?: { description?: string } } };
      error?: { description?: string };
      message?: string;
    };

    return (
      typedError.response?.data?.error?.description ||
      typedError.error?.description ||
      typedError.message ||
      "An unexpected error occurred"
    );
  }

  return "An unexpected error occurred";
};

/**
 * Response types for server actions
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  created_at: number;
  keyId?: string;
}

/**
 * Initiates a Razorpay payment order
 * @param amount - Amount in rupees
 * @param toUsername - Username of the recipient
 * @param paymentForm - Form data with name, message
 */
export const initiatePayment = async (
  amount: string | number,
  toUsername: string,
  paymentForm: { name: string; message?: string }
): Promise<ActionResponse<PaymentOrder>> => {
  try {
    await connectDb();

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      return { success: false, error: amountValidation.error };
    }

    // Validate recipient exists
    const user = await User.findOne({ username: toUsername?.toLowerCase().trim() }).lean();
    if (!user) {
      return { success: false, error: "Recipient user not found" };
    }

    // Use platform Razorpay credentials from environment variables
    const razorpayKeyId = (process.env.NEXT_PUBLIC_KEY_ID || process.env.KEY_ID)?.trim();
    const razorpaySecret = process.env.KEY_SECRET?.trim();

    if (!razorpayKeyId || !razorpaySecret) {
      return {
        success: false,
        error: "Platform payment gateway is not configured. Please check environment variables.",
      };
    }

    // Validate message
    const messageValidation = validateMessage(paymentForm?.message || "");
    if (!messageValidation.isValid) {
      return { success: false, error: messageValidation.error };
    }

    const amountInRupees = Number(amount);

    // Create Razorpay instance with credentials
    const razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    });

    // Create order
    let order: PaymentOrder;
    try {
      const createdOrder = await razorpayInstance.orders.create({
        amount: amountInRupees * 100,
        currency: "INR",
      });
      order = {
        ...createdOrder,
        keyId: razorpayKeyId,
      } as PaymentOrder;
    } catch (error: unknown) {
      const typedError = error as {
        response?: { data?: { error?: { description?: string } } };
        error?: { description?: string };
        statusCode?: number;
      };
      const errorMessage = getErrorMessage(error) || "Failed to create Razorpay order";

      console.error("Razorpay order creation failed:", {
        statusCode: typedError?.statusCode,
        message: errorMessage,
        username: toUsername,
      });

      return {
        success: false,
        error: "Payment initialization failed. Please try again later.",
      };
    }

    if (!order?.id) {
      return { success: false, error: "Invalid order response from payment provider" };
    }

    // Save payment record
    await Payment.create({
      amount: amountInRupees,
      toUser: user._id,
      toUsername: toUsername.toLowerCase(),
      orderId: order.id,
      message: paymentForm?.message?.trim() || "",
      name: paymentForm?.name?.trim() || "Anonymous",
      status: "pending",
    });

    return { success: true, data: order };
  } catch (error) {
    console.error("initiatePayment error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

/**
 * Fetch user profile by username or email
 */
export const fetchUser = async (identifier: string): Promise<ActionResponse<IUser | null>> => {
  try {
    await connectDb();

    const query = identifier?.includes("@") ? { email: identifier } : { username: identifier?.toLowerCase() };

    const user = await User.findOne(query).select("-razorpaySecret").lean();

    // Convert to plain object to avoid serialization issues
    const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;
    if (plainUser) delete plainUser.razorpaySecret;

    return { success: true, data: plainUser };
  } catch (error) {
    console.error("fetchUser error:", error);
    return { success: false, error: "Failed to fetch user" };
  }
};

/**
 * Fetch completed payments for a user (public endpoint)
 */
export const fetchPayments = async (username: string, limit: number = 7): Promise<ActionResponse<IPayment[]>> => {
  try {
    await connectDb();

    const payments = await Payment.find({
      toUsername: username?.toLowerCase(),
      status: "completed",
    })
      .sort({ amount: -1, createdAt: -1 })
      .limit(Math.min(limit, 20))
      .select("name amount message createdAt")
      .lean();

    // Convert to plain objects to avoid serialization issues
    const plainPayments = payments ? JSON.parse(JSON.stringify(payments)) : [];

    return { success: true, data: plainPayments };
  } catch (error) {
    console.error("fetchPayments error:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
};

/**
 * Fetch all payments for authenticated user (dashboard)
 */
export const fetchUserPayments = async (
  username: string,
  filters?: { status?: string; limit?: number }
): Promise<ActionResponse<IPayment[]>> => {
  try {
    await connectDb();

    const limit = Math.min(filters?.limit || 50, 100);
    const query: Record<string, string> = { toUsername: username?.toLowerCase() };

    if (filters?.status === "all") {
      // return all
    } else {
      query.status = filters?.status || "completed";
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    // Convert to plain objects to avoid serialization issues
    const plainPayments = payments ? JSON.parse(JSON.stringify(payments)) : [];

    return { success: true, data: plainPayments };
  } catch (error) {
    console.error("fetchUserPayments error:", error);
    return { success: false, error: "Failed to fetch payment history" };
  }
};

/**
 * Get donation statistics for a creator
 */
export const getDonationStats = async (username: string) => {
  try {
    await connectDb();

    const user = await User.findOne({ username: username?.toLowerCase() }).lean();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const stats = await Payment.aggregate([
      { $match: { toUsername: username?.toLowerCase(), status: "completed" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalDonations: { $sum: 1 },
          averageDonation: { $avg: "$amount" },
          maxDonation: { $max: "$amount" },
        },
      },
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      totalDonations: 0,
      averageDonation: 0,
      maxDonation: 0,
    };

    return {
      success: true,
      data: {
        ...result,
        averageDonation: Math.round(result.averageDonation || 0),
      },
    };
  } catch (error) {
    console.error("getDonationStats error:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
};

/**
 * Search users by username or name
 */
export const searchUsers = async (query: string): Promise<ActionResponse<Partial<IUser>[]>> => {
  try {
    await connectDb();

    const q = query?.trim();
    if (!q || q.length < 2) {
      return { success: true, data: [] };
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select("username name profilePicture bio")
      .limit(8)
      .lean();

    // Convert to plain objects to avoid serialization issues
    const plainUsers = users ? JSON.parse(JSON.stringify(users)) : [];

    return { success: true, data: plainUsers };
  } catch (error) {
    console.error("searchUsers error:", error);
    return { success: false, error: "Failed to search users" };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  formData: FormData,
  userIdentifier: string
): Promise<ActionResponse> => {
  try {
    await connectDb();

    // Parse form data
    const data = Object.fromEntries(formData);

    // Validate profile data
    const validation = validateProfileUpdate({
      name: data.name as string,
      bio: data.bio as string,
      username: data.username as string,
    });

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Find existing user
    const query = userIdentifier?.includes("@") ? { email: userIdentifier } : { username: userIdentifier };
    const existingUser = await User.findOne(query);

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Check if username is being changed and validate uniqueness
    if (existingUser.username !== (data.username as string)?.toLowerCase()) {
      const usernameCheck = await User.findOne({ username: (data.username as string)?.toLowerCase() });
      if (usernameCheck) {
        return { success: false, error: "Username is already taken" };
      }
    }

    // Prepare update data
    let encryptedSecret = existingUser.razorpaySecret;
    const rawSecret = (data.razorpaySecret as string)?.trim();
    if (rawSecret) {
      encryptedSecret = encryptText(rawSecret);
    }

    // Exclude _id and other immutable fields from update
    const { _id, __v, createdAt, updatedAt, totalDonations, ...restData } = data as Record<string, unknown>;

    const toString = (value: unknown): string => (typeof value === "string" ? value : "");

    const updateData: Partial<IUser> = {
      name: toString(restData.name) || existingUser.name,
      bio: toString(restData.bio) || existingUser.bio,
      username: toString(restData.username).toLowerCase() || existingUser.username,
      email: toString(restData.email) || existingUser.email,
      profilePicture: toString(restData.profilePicture) || existingUser.profilePicture,
      coverImage: toString(restData.coverImage) || existingUser.coverImage,
      razorpayId: toString(restData.razorpayId) || existingUser.razorpayId,
      razorpaySecret: encryptedSecret,
    };

    // Update user
    await User.updateOne({ _id: existingUser._id }, updateData);

    return { success: true, data: { message: "Profile updated successfully" } };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
};
