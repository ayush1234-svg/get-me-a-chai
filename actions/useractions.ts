"use server";

import Razorpay from "razorpay";
import Payment from "@/app/models/Payment";
import User from "@/app/models/User";
import connectDb from "@/app/db/connectDb";
import type { IUser } from "@/app/models/User";
import type { IPayment } from "@/app/models/Payment";
import {
  validateAmount,
  validateRazorpayCredentials,
  validateUsername,
  validateProfileUpdate,
  validateMessage,
} from "@/lib/validation";
import { decryptText, encryptText, hasEncryptionKey } from "@/lib/crypto";

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
    const user = await User.findOne({ username: toUsername?.toLowerCase().trim() })
      .select("+razorpaySecret")
      .lean();
    if (!user) {
      return { success: false, error: "Recipient user not found" };
    }

    const razorpaySecret = user.razorpaySecret ? decryptText(user.razorpaySecret) : undefined;

    // Validate Razorpay credentials
    const credentialValidation = validateRazorpayCredentials(user.razorpayId, razorpaySecret);
    if (!credentialValidation.isValid) {
      return { success: false, error: credentialValidation.error };
    }

    // Validate message
    const messageValidation = validateMessage(paymentForm?.message || "");
    if (!messageValidation.isValid) {
      return { success: false, error: messageValidation.error };
    }

    const amountInRupees = Number(amount);

    // Create Razorpay instance with credentials
    const razorpayInstance = new Razorpay({
      key_id: user.razorpayId!.trim(),
      key_secret: razorpaySecret!.trim(),
    });

    // Create order
    let order: PaymentOrder;
    try {
      order = await razorpayInstance.orders.create({
        amount: amountInRupees * 100,
        currency: "INR",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.description ||
        error?.error?.description ||
        error?.message ||
        "Failed to create Razorpay order";

      console.error("Razorpay order creation failed:", {
        statusCode: error?.statusCode,
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
    const query: any = { toUsername: username?.toLowerCase() };

    if (filters?.status) {
      query.status = filters.status;
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
    const { _id, __v, createdAt, updatedAt, totalDonations, ...restData } = data as any;

    const updateData: Partial<IUser> = {
      name: (restData.name as string) || existingUser.name,
      bio: (restData.bio as string) || existingUser.bio,
      username: ((restData.username as string)?.toLowerCase() || existingUser.username) as string,
      email: (restData.email as string) || existingUser.email,
      profilePicture: (restData.profilePicture as string) || existingUser.profilePicture,
      coverImage: (restData.coverImage as string) || existingUser.coverImage,
      razorpayId: (restData.razorpayId as string) || existingUser.razorpayId,
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
