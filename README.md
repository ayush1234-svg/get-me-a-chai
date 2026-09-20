# Get Me A Tea ☕

**Get Me A Tea** is a full-stack creator monetization platform where fans and supporters can buy a "tea" (a small donation) for their favourite creators. Built with **Next.js 16**, **TypeScript**, **MongoDB**, and **Razorpay**, it provides a seamless, secure experience for both creators and their supporters.

---

## 🚀 How It Works

### For Creators
1. **Sign up** using GitHub OAuth — no passwords needed.
2. **Complete your profile** — set a bio, profile picture, cover image, and social links via the Dashboard.
3. **Connect Razorpay** — paste your Razorpay Key ID and Secret in the Dashboard to start accepting payments.
4. **Share your page** — every creator gets a unique public URL: `yoursite.com/your-username`.
5. **Track earnings** — view real-time donation stats, history, and supporter messages on the Dashboard.

### For Supporters
1. Visit any creator's public page (e.g. `yoursite.com/ayush`).
2. Enter a donation amount (₹1 – ₹1,00,000) and an optional message.
3. Complete the secure payment via Razorpay.
4. The creator receives a notification and the payment appears in their Dashboard instantly.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 GitHub OAuth | Passwordless login via NextAuth.js |
| 👤 Creator Profiles | Public pages with bio, cover image & social links |
| 💸 Razorpay Payments | Secure payment initiation and signature verification |
| 📊 Dashboard Analytics | Total donations, supporter count, average & highest donation |
| 📋 Payment History | Filter by status — Pending / Completed / Failed |
| 🔍 Creator Search | Discover creators by name or username |
| 🛡️ Input Validation | Server-side validated forms and actions |
| 📱 Responsive UI | Mobile-first design with Tailwind CSS |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**

### Backend
- **Next.js Server Actions** — type-safe, server-side logic
- **Next.js API Routes** — Razorpay webhook/verification endpoint

### Database
- **MongoDB** (Atlas or local)
- **Mongoose** — schema modelling with ObjectId references

### Authentication
- **NextAuth.js** — session management
- **GitHub OAuth** — social sign-in

### Payments
- **Razorpay** — order creation, payment capture, and HMAC signature verification

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   └── razorpay/               # Payment verification endpoint
│   ├── models/
│   │   ├── User.ts                 # User schema (profile, Razorpay creds, stats)
│   │   └── Payment.ts              # Payment schema (amount, status, donor info)
│   ├── db/
│   │   └── connectDb.ts            # MongoDB connection utility
│   ├── Dashboard/
│   │   └── page.tsx                # Creator dashboard
│   ├── [username]/
│   │   └── page.js                 # Public creator donation page
│   ├── login/
│   │   └── page.jsx                # Login page
│   └── layout.tsx                  # Root layout + metadata
├── actions/
│   └── useractions.ts              # Server actions (payments, profile, stats)
├── components/
│   ├── PaymentPage.js              # Donation form with Razorpay SDK
│   ├── Navbar.jsx                  # Navigation bar
│   ├── Footer.jsx                  # Footer
│   └── SessionWrapper.jsx          # NextAuth session provider wrapper
├── lib/
│   └── validation.ts               # Centralised input validation utilities
├── public/
│   └── assets/                     # Static images
├── .env.example                    # Environment variable template
├── next.config.ts                  # Next.js configuration
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- [GitHub OAuth App](https://github.com/settings/developers)
- [Razorpay merchant account](https://dashboard.razorpay.com)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/get-me-a-tea.git
cd get-me-a-tea

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-secret   # openssl rand -base64 32

# GitHub OAuth
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
```

```bash
# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Schema

### User
```typescript
{
  name, email (unique), username (unique),
  profilePicture?, coverImage?, bio?,
  razorpayId?, razorpaySecret?,
  socialLinks?: { twitter?, instagram?, linkedin? },
  totalDonations: number,
  createdAt, updatedAt
}
```

### Payment
```typescript
{
  name,                        // donor's display name
  toUser: ObjectId,            // reference to creator
  toUsername: string,          // indexed for fast queries
  orderId: string (unique),    // Razorpay order ID
  paymentId?: string,          // Razorpay payment ID (on success)
  message?: string,            // optional supporter note
  amount: number,              // in paise (₹1 = 100 paise)
  status: "pending" | "completed" | "failed",
  createdAt, updatedAt
}
```

---

## 🔑 Key Server Actions (`actions/useractions.ts`)

| Action | Description |
|---|---|
| `initiatePayment(amount, toUsername, form)` | Creates a Razorpay order and saves a pending payment record |
| `verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)` | Verifies HMAC signature and marks payment as completed |
| `fetchUser(identifier)` | Fetch user by username or email |
| `getDonationStats(username)` | Aggregated stats — total, count, average, max donations |
| `fetchUserPayments(username, filters)` | Paginated, filterable payment history |
| `updateProfile(formData, userIdentifier)` | Update bio, links, images, and Razorpay credentials |

---

## 🛡️ Security

- **Razorpay signature verification** — payments confirmed only after HMAC-SHA256 check
- **NextAuth.js sessions** — protected routes, no plaintext credentials
- **Server-side validation** — all inputs sanitised before DB writes
- **Environment secrets** — no sensitive data in client bundle

---

## 🚀 Deployment (Vercel)

```bash
npm install -g vercel
vercel login
vercel
```

Set these environment variables in your Vercel project settings:

```
MONGODB_URI
NEXTAUTH_URL       # your production domain
NEXTAUTH_SECRET
GITHUB_ID
GITHUB_SECRET
NODE_ENV=production
```

---

## 💡 Future Enhancements

- [ ] Email notifications for new donations
- [ ] Donation tiers and fundraising goals
- [ ] Advanced analytics with charts
- [ ] Recurring donations / subscriptions
- [ ] Multiple payment gateway support
- [ ] Creator reviews and ratings
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

**Ayush Dabhade**

---

*Built with ❤️ for creators everywhere.*

