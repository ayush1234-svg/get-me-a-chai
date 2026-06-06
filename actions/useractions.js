"use server"

import Razorpay from "razorpay"
import Payment from "@/app/models/Payment"
import connectDb from "@/app/db/connectDb"
import User from "@/app/models/User.js"


export const initiatePayment = async (amount, to_user, paymentform) => {
  await connectDb()

  const amountInRupees = Number(amount)
  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
    throw new Error("Invalid payment amount")
  }
  const user = await User.findOne({ username: to_user }).lean()

  if (!user) {
    throw new Error("User not found")
  }

  const keyId = user.razorpayId?.trim()
  const keySecret = user.razorpaySecret?.trim()

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured on the server")
  }

  const instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  })

  let options = {
    amount: amountInRupees * 100,
    currency: "INR"
  }

  let order
  try {
    order = await instance.orders.create(options)
  } catch (error) {
    const message =
      error?.statusCode && error?.error?.description
        ? `Razorpay ${error.statusCode}: ${error.error.description}`
        : error?.error?.description ||
          error?.description ||
          error?.message ||
          "Unable to create Razorpay order. Check Razorpay credentials and network access."

    console.error("Razorpay order creation failed", {
      statusCode: error?.statusCode,
      code: error?.error?.code,
      description: error?.error?.description,
      message: error?.message,
      username: to_user,
      hasKeyId: Boolean(keyId),
      hasKeySecret: Boolean(keySecret),
    })

    throw new Error(message)
  }

  if (!order?.id) {
    throw new Error("Razorpay did not return a valid order")
  }

  await Payment.create({
    amount: amountInRupees,
    to_user: to_user,
    oid: order.id,
    message: paymentform?.message || "",
    name: paymentform?.name || "Anonymous"
  })

  return order
}

export const fetchuser = async (username) => {

  await connectDb()
  const query = username?.includes("@")
    ? { email: username }
    : { username: username }

  let u = await User.findOne(query).lean()
  
  return u ? JSON.parse(JSON.stringify(u)) : null

} 


export const fetchPayment = async (username) => {

  await connectDb()
  let p = await Payment.find({ to_user: username , done : true }).sort({amount : -1}).limit(7).lean()

  return p ? JSON.parse(JSON.stringify(p)) : []

} 

export const searchUsers = async (query) => {
  await connectDb()

  const q = query?.trim()
  if (!q || q.length < 2) {
    return []
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(escaped, "i")

  const users = await User.find({
    $or: [{ username: regex }, { name: regex }],
  })
    .select("username name profilePicture")
    .limit(8)
    .lean()

  return JSON.parse(JSON.stringify(users))
}

export const updateProfile = async(data , oldusername) => {
  await connectDb()
  const ndata = Object.fromEntries(data)
  const query = oldusername?.includes("@")
    ? { email: oldusername }
    : { username: oldusername }
  const existingUser = await User.findOne(query)

  if (!existingUser) {
    return { error: "User not found" }
  }

  if (existingUser.username !== ndata.username) {
    let u = await User.findOne({ username: ndata.username })
    if (u) {
      return { error: "User Already Exist" }
    }
  }

  await User.updateOne({ _id: existingUser._id }, ndata)
  return { success: true }

}
