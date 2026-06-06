"use client"
import React, { useRef, useState, useEffect } from "react"
import Script from "next/script"
import { fetchPayments, initiatePayment, fetchUser } from "../actions/useractions"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useSearchParams } from "next/navigation"

const PaymentPage = ({ username }) => {
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    amount: "",
    message: "",
  })

  const [currentUser, setCurrentUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const searchParams = useSearchParams()
  const initialUsername = useRef(username)

  useEffect(() => {
    if (searchParams.get("paymentSuccess") === "true") {
      toast.success("Donation completed successfully!")
    }
  }, [searchParams])

  useEffect(() => {
    const loadData = async () => {
      if (!initialUsername.current) return

      try {
        const userResponse = await fetchUser(initialUsername.current)
        const paymentsResponse = await fetchPayments(initialUsername.current)

        if (userResponse.success) {
          setCurrentUser(userResponse.data)
        }

        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data || [])
        }
      } catch (err) {
        console.error(err)
        setError("Unable to load creator information.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value })
  }

  const pay = async (amount) => {
    setError("")
    const donationAmount = typeof amount === "number" ? amount : Number(amount)

    if (!donationAmount || donationAmount < 1) {
      setError("Please enter a valid donation amount.")
      return
    }

    if (!currentUser) {
      setError("Creator not found.")
      return
    }

    const orderResponse = await initiatePayment(donationAmount, username, {
      name: paymentForm.name.trim() || "Anonymous",
      message: paymentForm.message.trim(),
    })

    if (!orderResponse.success) {
      setError(orderResponse.error || "Unable to start payment.")
      return
    }

    const order = orderResponse.data
    if (!order?.id) {
      setError("Payment provider returned invalid order data.")
      return
    }

    if (!window.Razorpay) {
      setError("Payment library failed to load. Refresh and try again.")
      return
    }

    const options = {
      key: currentUser?.razorpayId,
      amount: order.amount,
      currency: "INR",
      name: currentUser?.name || `@${currentUser?.username}`,
      description: "Donation for creator",
      order_id: order.id,
      callback_url: `${window.location.origin}/razorpay`,
      redirect: true,
      prefill: {
        name: paymentForm.name || "Anonymous",
        email: "",
        contact: "",
      },
      theme: {
        color: "#6366f1",
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (loading) {
    return <div className="text-center mt-10 text-xl text-white">Loading creator profile...</div>
  }

  if (!currentUser) {
    return <div className="text-center mt-10 text-xl text-white">Creator not found</div>
  }

  const totalRaised = payments.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <>
      <ToastContainer />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="relative">
        <img
          className="w-full object-cover h-[320px]"
          src={currentUser?.coverImage || "/default-cover.jpg"}
          alt="Cover image"
        />
        <img
          className="absolute h-28 w-28 bottom-[-36px] right-10 rounded-full border-4 border-white bg-slate-900"
          src={currentUser?.profilePicture || "/default-avatar.jpg"}
          alt="Creator"
        />
      </div>

      <div className="container mx-auto px-4 py-10 text-white">
        <div className="rounded-3xl bg-slate-950/95 border border-slate-800 p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Support a creator</p>
              <h1 className="mt-3 text-4xl font-bold">@{currentUser.username}</h1>
              {currentUser.bio && <p className="mt-4 max-w-2xl text-slate-300">{currentUser.bio}</p>}
            </div>
            <div className="rounded-3xl bg-slate-900 border border-slate-700 p-5 text-center">
              <p className="text-sm text-slate-400">Raised so far</p>
              <p className="text-3xl font-bold text-white">₹{totalRaised.toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-400">{payments.length} donation{payments.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent support</h2>
              {payments.length === 0 ? (
                <p className="text-slate-400">No donations yet. Be the first to support!</p>
              ) : (
                <ul className="space-y-4">
                  {payments.map((payment, index) => (
                    <li key={index} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{payment.name || "Anonymous"}</span>
                        <span className="text-indigo-300">₹{payment.amount}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{payment.message || "No message provided"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">
              <h2 className="text-2xl font-semibold mb-4">Donate now</h2>
              {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
              <label className="block text-sm text-slate-400 mb-2">Your name</label>
              <input
                value={paymentForm.name}
                name="name"
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-400"
                placeholder="Anonymous"
              />
              <label className="mt-4 block text-sm text-slate-400 mb-2">Amount (INR)</label>
              <input
                value={paymentForm.amount}
                name="amount"
                type="number"
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-400"
                placeholder="Enter amount"
                min={1}
              />
              <label className="mt-4 block text-sm text-slate-400 mb-2">Message</label>
              <textarea
                value={paymentForm.message}
                name="message"
                onChange={handleChange}
                rows={4}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-400"
                placeholder="Leave a note for the creator"
              />
              <button
                type="button"
                onClick={() => pay(paymentForm.amount)}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                Donate now
              </button>
              <div className="mt-4 flex flex-wrap gap-3">
                {[20, 50, 100].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => pay(tier)}
                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    ₹{tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentPage