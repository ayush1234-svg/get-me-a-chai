import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  // Don't reconnect if already connected
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/get-me-a-chai";

  try {
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectDb;
