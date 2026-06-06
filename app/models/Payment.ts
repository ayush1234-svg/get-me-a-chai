import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  toUser: Types.ObjectId;
  toUsername: string;
  orderId: string;
  paymentId?: string;
  message?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    name: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient user ID is required"],
      index: true,
    },
    toUsername: {
      type: String,
      required: [true, "Recipient username is required"],
      lowercase: true,
      index: true,
    },
    orderId: {
      type: String,
      required: [true, "Razorpay Order ID is required"],
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
      max: [100000, "Amount cannot exceed 100000"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PaymentSchema.index({ toUser: 1, status: 1 });
PaymentSchema.index({ toUsername: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ amount: -1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
