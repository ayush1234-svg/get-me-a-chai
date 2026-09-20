"use server"

import Razorpay from "razorpay"
import Payment from "@/app/models/Payment"
import connectDb from "@/app/db/connectDb"
import User from "@/app/models/User.js"


export const initiatePayment = async (amount, to_user, paymentform) => {
  try {
    await connectDb()

    const amountInRupees = Number(amount)
    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return { success: false, error: "Invalid payment amount" }
    }

    const username = to_user?.toLowerCase().trim()
    const user = await User.findOne({ username })
      .select("+razorpaySecret")
      .lean()

    if (!user) {
      return { success: false, error: "Recipient user not found" }
    }

    const keyId = (process.env.NEXT_PUBLIC_KEY_ID || process.env.KEY_ID)?.trim()
    const keySecret = process.env.KEY_SECRET?.trim()

    if (!keyId || !keySecret) {
      return { success: false, error: "Razorpay credentials are not configured on the server" }
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    })

    const order = await instance.orders.create({
      amount: amountInRupees * 100,
      currency: "INR"
    })

    if (!order?.id) {
      return { success: false, error: "Razorpay did not return a valid order" }
    }

    await Payment.create({
      amount: amountInRupees,
      toUser: user._id,
      toUsername: username,
      orderId: order.id,
      message: paymentform?.message?.trim() || "",
      name: paymentform?.name?.trim() || "Anonymous",
      status: "pending"
    })

    return { success: true, data: { ...order, keyId } }
  } catch (error) {
    console.error("initiatePayment error", {
      statusCode: error?.statusCode,
      code: error?.error?.code,
      description: error?.error?.description,
      message: error?.message,
      username: to_user,
    })
    return { success: false, error: "Payment initialization failed. Please try again later." }
  }
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
