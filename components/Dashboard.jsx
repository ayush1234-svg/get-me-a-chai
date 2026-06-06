"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  updateProfile,
  fetchUser,
  getDonationStats,
  fetchUserPayments,
} from "@/actions/useractions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

const Dashboard = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    _id: "",
    name: "",
    email: "",
    username: "",
    profilePicture: "",
    coverImage: "",
    bio: "",
    razorpayId: "",
    razorpaySecret: "",
    totalDonations: 0,
    createdAt: "",
  });

  const [stats, setStats] = useState({
    totalAmount: 0,
    totalDonations: 0,
    averageDonation: 0,
    maxDonation: 0,
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const userResponse = await fetchUser(session.user.email);
        if (userResponse.success && userResponse.data) {
          setForm(userResponse.data);

          // Load stats
          if (userResponse.data.username) {
            const statsResponse = await getDonationStats(userResponse.data.username);
            if (statsResponse.success) {
              setStats(statsResponse.data);
            }

            // Load recent payments
            const paymentsResponse = await fetchUserPayments(userResponse.data.username, {
              limit: 10,
            });
            if (paymentsResponse.success) {
              setPayments(paymentsResponse.data || []);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [status, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // Exclude immutable fields from form data
        if (value && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'totalDonations') {
          formData.append(key, String(value));
        }
      });

      const result = await updateProfile(formData, session?.user?.email || "");

      if (result.success) {
        await update({ username: form.username });
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <ToastContainer />

      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <div className="flex gap-4 items-center">
            <Link href={`/${form.username}`}>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                View Profile
              </button>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur">
        <div className="container mx-auto px-4 flex gap-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-2 font-medium transition ${
              activeTab === "profile"
                ? "border-b-2 border-purple-500 text-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-4 px-2 font-medium transition ${
              activeTab === "stats"
                ? "border-b-2 border-purple-500 text-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-4 px-2 font-medium transition ${
              activeTab === "payments"
                ? "border-b-2 border-purple-500 text-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Payment History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
              <h2 className="text-2xl font-bold mb-8">Edit Profile</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture & Cover */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                    <input
                      type="text"
                      name="profilePicture"
                      value={form.profilePicture || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/profile.jpg"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                    <input
                      type="text"
                      name="coverImage"
                      value={form.coverImage || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg flex items-center">
                      /
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="username"
                      className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bio (max 500 characters)</label>
                  <textarea
                    name="bio"
                    value={form.bio || ""}
                    onChange={handleChange}
                    placeholder="Tell your supporters about yourself..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <div className="text-sm text-slate-400 mt-1">
                    {(form.bio || "").length}/500
                  </div>
                </div>

                {/* Razorpay Credentials */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Add your Razorpay credentials to accept donations
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Razorpay Key ID</label>
                      <input
                        type="password"
                        name="razorpayId"
                        value={form.razorpayId || ""}
                        onChange={handleChange}
                        placeholder="rzp_test_..."
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Razorpay Key Secret</label>
                      <input
                        type="password"
                        name="razorpaySecret"
                        value={form.razorpaySecret || ""}
                        onChange={handleChange}
                        placeholder="Your secret key"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
              <div className="text-sm text-purple-300 mb-2">Total Donations</div>
              <div className="text-4xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-purple-400 mt-2">
                From {stats.totalDonations} supporter{stats.totalDonations !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
              <div className="text-sm text-blue-300 mb-2">Average Donation</div>
              <div className="text-4xl font-bold">₹{stats.averageDonation}</div>
              <div className="text-sm text-blue-400 mt-2">Per supporter</div>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700">
              <div className="text-sm text-green-300 mb-2">Highest Donation</div>
              <div className="text-4xl font-bold">₹{stats.maxDonation.toLocaleString()}</div>
              <div className="text-sm text-green-400 mt-2">Single donation</div>
            </div>

            <div className="bg-gradient-to-br from-pink-900 to-pink-800 rounded-lg p-6 border border-pink-700">
              <div className="text-sm text-pink-300 mb-2">Profile Link</div>
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/${form.username}`)}
                className="text-sm text-pink-300 hover:text-pink-200 break-all text-left"
              >
                /{form.username}
              </button>
              <div className="text-sm text-pink-400 mt-2">Click to copy</div>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === "payments" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Payment History</h2>

            {payments.length === 0 ? (
              <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 text-center">
                <p className="text-slate-400">No payments received yet</p>
                <p className="text-sm text-slate-500 mt-2">
                  Share your profile link to start receiving donations!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{payment.name}</h3>
                        <p className="text-sm text-slate-400">
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          ₹{payment.amount.toLocaleString()}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === "completed"
                              ? "bg-green-900 text-green-300"
                              : payment.status === "pending"
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-red-900 text-red-300"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    {payment.message && (
                      <p className="text-slate-300 text-sm border-t border-slate-800 pt-3 mt-3">
                        💬 {payment.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
