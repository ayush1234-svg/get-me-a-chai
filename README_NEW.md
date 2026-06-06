# Get Me A Chai ☕️

A modern crowdfunding platform that enables creators to receive donations from their fans and supporters. Built with Next.js 16, TypeScript, Tailwind CSS, and Razorpay for secure payments.

## 🎯 Features

- **Creator Profiles**: Customizable user profiles with bio, cover image, and social links
- **Donation System**: Seamless donation experience powered by Razorpay
- **Creator Dashboard**: 
  - View donation statistics (total, average, highest donation)
  - Payment history with filters
  - Profile management and Razorpay credentials setup
  - Real-time donation updates
- **Public Creator Pages**: Dedicated pages for each creator to receive donations
- **GitHub Authentication**: Secure login with GitHub OAuth
- **Payment Verification**: Secure payment verification using Razorpay signatures
- **Search Functionality**: Discover creators by name or username
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Toastify** - Toast notifications
- **NextAuth.js** - Authentication

### Backend
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Razorpay** - Payment gateway

### Architecture
- **Server Actions** - Next.js server-side functions
- **Database Models** - TypeScript-defined MongoDB schemas
- **Validation Layer** - Input validation utilities

## 📋 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/        # NextAuth authentication
│   │   └── razorpay/                  # Payment verification endpoint
│   ├── models/
│   │   ├── User.ts                    # User schema with TypeScript
│   │   └── Payment.ts                 # Payment schema with ObjectId references
│   ├── db/
│   │   └── connectDb.ts               # MongoDB connection utility
│   ├── Dashboard/
│   │   └── page.tsx                   # Creator dashboard (stats, payments, profile)
│   ├── [username]/
│   │   └── page.js                    # Creator donation page
│   ├── login/
│   │   └── page.jsx                   # Login page
│   └── layout.tsx                     # Root layout
├── actions/
│   └── useractions.ts                 # Server actions for data operations
├── components/
│   ├── PaymentPage.js                 # Payment form component
│   ├── Navbar.jsx                     # Navigation bar
│   ├── Footer.jsx                     # Footer
│   └── SessionWrapper.jsx             # NextAuth session provider
├── lib/
│   └── validation.ts                  # Input validation utilities
├── public/
│   └── assets/                        # Images and static files
├── .env.example                       # Environment variables template
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
└── package.json                       # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB instance (local or MongoDB Atlas)
- GitHub OAuth credentials
- Razorpay merchant account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/get-me-a-chai.git
cd get-me-a-chai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-32-character-secret

# GitHub OAuth
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
```

4. **Generate NextAuth Secret**
```bash
openssl rand -base64 32
```

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Setup Guides

### GitHub OAuth Setup
1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Get Me A Chai
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

### MongoDB Setup
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and get connection string
3. Add connection string to `.env.local`

### Razorpay Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get your Key ID and Key Secret from settings
3. Users add their credentials in the Dashboard

## 📱 Usage

### For Creators
1. **Sign up** with GitHub
2. **Complete profile** in Dashboard
3. **Add Razorpay credentials** to accept payments
4. **Share your profile link**: `yoursite.com/your-username`
5. **View donations** in Dashboard

### For Supporters
1. Visit creator's profile
2. Enter donation amount (₹1 - ₹100,000)
3. Add optional message
4. Complete secure payment via Razorpay
5. Payment confirmation and thank you message

## 🗄️ Database Schema

### User Model
```typescript
interface IUser {
  _id: ObjectId
  name: string
  email: string (unique, required)
  username: string (unique, required)
  profilePicture?: string
  coverImage?: string
  bio?: string (max 500 chars)
  razorpayId?: string
  razorpaySecret?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  totalDonations: number
  createdAt: Date
  updatedAt: Date
}
```

### Payment Model
```typescript
interface IPayment {
  _id: ObjectId
  name: string
  toUser: ObjectId (ref to User)
  toUsername: string (indexed)
  orderId: string (unique, indexed)
  paymentId?: string
  message?: string (max 500 chars)
  amount: number
  status: "pending" | "completed" | "failed"
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Key Server Actions

### `initiatePayment(amount, toUsername, paymentForm)`
Initiates a Razorpay payment order with validation

**Returns**: `ActionResponse<PaymentOrder>`

### `fetchUser(identifier)`
Fetch user profile by username or email

**Returns**: `ActionResponse<IUser>`

### `getDonationStats(username)`
Get donation statistics for a creator

**Returns**: Statistics including total, count, average, max donations

### `fetchUserPayments(username, filters)`
Fetch payment history with filtering options

**Returns**: `ActionResponse<IPayment[]>`

### `updateProfile(formData, userIdentifier)`
Update user profile with validation

**Returns**: `ActionResponse`

## 🛡️ Security Features

- **Input Validation**: All inputs validated server-side using `lib/validation.ts`
- **Password Protection**: Razorpay credentials stored encrypted (recommended: use environment-specific values)
- **Payment Verification**: Razorpay signature verification on payment completion
- **Authentication**: Secure session-based authentication with NextAuth.js
- **Error Handling**: Comprehensive error messages without exposing sensitive data
- **Database Indexing**: Optimized indexes for performance

## ✨ Best Practices Implemented

- **TypeScript**: Full type safety across the codebase
- **Server Actions**: Secure server-side operations
- **Error Handling**: Try-catch blocks with meaningful error messages
- **Validation**: Centralized validation utilities
- **Database Relations**: Proper ObjectId references between collections
- **Performance**: Database indexes on frequently queried fields
- **Code Organization**: Modular structure with clear separation of concerns
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables (Production)
Set these in your hosting platform:
```
MONGODB_URI
NEXTAUTH_URL (use your production domain)
NEXTAUTH_SECRET
GITHUB_ID
GITHUB_SECRET
NODE_ENV=production
```

## 📊 Analytics & Monitoring

The dashboard provides:
- Total donations received
- Average donation amount
- Highest single donation
- Recent donations with timestamps
- Donor messages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 💡 Future Enhancements

- [ ] Email notifications for new donations
- [ ] Donation tiers/goals
- [ ] Automated donor thank you emails
- [ ] Advanced analytics and charts
- [ ] Multiple payment gateway support
- [ ] Internationalization (i18n)
- [ ] Creator reviews/ratings
- [ ] Tax documentation automation
- [ ] Recurring donations/subscriptions
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### "User not found" error
- Ensure username is lowercase and 3-20 characters
- Check database connection

### Razorpay payment fails
- Verify credentials in Dashboard
- Check Razorpay account status and balance
- Ensure test/live mode matches environment

### MongoDB connection timeout
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure network connectivity

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [documentation](./README.md)
- Review [.env.example](./.env.example)

---

**Built with ❤️ for creators**
