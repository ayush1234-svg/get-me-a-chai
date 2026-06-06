import { NextResponse, type NextRequest } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import Payment from "@/app/models/Payment";
import connectDb from "@/app/db/connectDb";
import User from "@/app/models/User";
import type { IPayment } from "@/app/models/Payment";
import { decryptTextSafe } from "@/lib/crypto";

/**
 * POST /api/razorpay
 * Handles Razorpay payment verification and updates payment status
 */
export const POST = async (request: NextRequest) => {
  try {
    await connectDb();

    const data = await request.formData();
    const paymentData = Object.fromEntries(data) as Record<string, string>;

    // Validate required fields
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = (await Payment.findOne({
      orderId: razorpay_order_id,
    }).lean()) as IPayment | null;

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      );
    }

    // Get user and verify Razorpay secret
    const user = await User.findOne({ username: payment.toUsername })
      .select("+razorpaySecret")
      .lean();

    const rawSecret = user?.razorpaySecret;
    if (!rawSecret) {
      console.error("User Razorpay secret missing:", {
        username: payment.toUsername,
      });
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const razorpaySecret = decryptTextSafe(rawSecret).trim();

    // Verify payment signature
    const isVerified = validatePaymentVerification(
      {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
      razorpay_signature,
      razorpaySecret
    );

    if (!isVerified) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed", paymentId: razorpay_payment_id },
        { returnDocument: 'after' }
      );

      console.warn("Payment verification failed:", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update payment status to completed
    const updatedPayment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: "completed",
        paymentId: razorpay_payment_id,
      },
      { returnDocument: 'after' }
    );

    // Update user's total donations
    await User.findByIdAndUpdate(payment.toUser, {
      $inc: { totalDonations: payment.amount },
    });

    console.log("Payment verified successfully:", {
      orderId: razorpay_order_id,
      username: payment.toUsername,
      amount: payment.amount,
    });

    // Redirect to creator's page with success parameter
    const redirectUrl = new URL(
      `/${updatedPayment?.toUsername}?paymentSuccess=true`,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during payment verification",
      },
      { status: 500 }
    );
  }
};

/**
 * GET /api/razorpay
 * Health check endpoint
 */
export const GET = () => {
  return NextResponse.json({
    message: "Razorpay payment verification endpoint",
    method: "POST",
  });
};
