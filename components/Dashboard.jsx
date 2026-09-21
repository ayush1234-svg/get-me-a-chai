"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
              limit: 20,
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
        if (
          value &&
          key !== "_id" &&
          key !== "__v" &&
          key !== "createdAt" &&
          key !== "updatedAt" &&
          key !== "totalDonations"
        ) {
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
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-10">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-xs text-gray-400 sm:text-sm">Manage your creator profile and track your tea support.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/${form.username}`}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-gray-700 sm:px-4 sm:text-sm"
          >
            View Public Page
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-800 sm:gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`shrink-0 pb-3 px-2 text-sm font-medium transition border-b-2 sm:px-3 ${
            activeTab === "profile"
              ? "border-blue-500 text-white font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`shrink-0 pb-3 px-2 text-sm font-medium transition border-b-2 sm:px-3 ${
            activeTab === "stats"
              ? "border-blue-500 text-white font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`shrink-0 pb-3 px-2 text-sm font-medium transition border-b-2 sm:px-3 ${
            activeTab === "payments"
              ? "border-blue-500 text-white font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Supporters ({payments.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="mt-6 sm:mt-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Profile Details</h2>
              <p className="text-sm text-gray-400">Update your public profile information and images.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Profile Picture URL</label>
                  <input
                    type="text"
                    name="profilePicture"
                    value={form.profilePicture || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Cover Image URL</label>
                  <input
                    type="text"
                    name="coverImage"
                    value={form.coverImage || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-950/50 border border-gray-800 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 text-gray-400 text-sm">
                    /
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={form.username || ""}
                    onChange={handleChange}
                    placeholder="username"
                    className="flex-1 px-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-r-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-300">About / Bio</label>
                  <span className="text-xs text-gray-500">{(form.bio || "").length}/500</span>
                </div>
                <textarea
                  name="bio"
                  value={form.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell your supporters about who you are and what you create..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Raised</p>
                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">₹{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  From {stats.totalDonations} contribution{stats.totalDonations !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Average Support</p>
                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">₹{stats.averageDonation.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Per supporter</p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Top Donation</p>
                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">₹{stats.maxDonation.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Single donation</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
              <div>
                <p className="text-sm font-medium text-white">Your Public Page URL</p>
                <p className="text-xs text-gray-400 mt-0.5">Share this link with your audience to receive support.</p>
                <p className="text-sm text-blue-400 font-mono mt-2 select-all">
                  {typeof window !== "undefined" ? `${window.location.origin}/${form.username}` : `/${form.username}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`${window.location.origin}/${form.username}`)}
                className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition shrink-0"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === "payments" && (
          <div>
            {payments.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-300 font-medium">No supporters yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Share your public page link to start receiving tea support!
                </p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-800/40 transition"
                  >
                    <div>
                      <span className="font-medium text-white text-base">{payment.name || "Anonymous"}</span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {payment.message && (
                        <p className="text-sm text-gray-300 mt-2 bg-gray-950/60 border border-gray-800 px-3 py-1.5 rounded-lg inline-block">
                          &ldquo;{payment.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-bold text-white">₹{payment.amount.toLocaleString()}</span>
                    </div>
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
