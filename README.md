
# Get Me A Chai ☕

Get Me A Chai is a full-stack creator support platform built with Next.js and the MERN stack, allowing creators to receive donations directly from their supporters through Razorpay integration.

The platform provides secure authentication, creator dashboards, donation tracking, analytics, and payment management features.

---

# Features

## Authentication

* GitHub OAuth authentication using NextAuth
* Secure user sessions and protected routes

## Creator Profiles

* Public creator pages for receiving support
* Personalized creator information and donation links

## Razorpay Integration

* Secure Razorpay payment gateway integration
* Payment signature verification for secure transactions
* Payment receipt verification and tracking

## Creator Dashboard

* View recent donation activity
* Track payment status (Pending / Completed / Failed)
* Manage creator payment settings
* Access public donation page directly

## Analytics & Statistics

* Total donations received
* Number of supporters
* Average donation amount
* Largest donation received
* Donation history and fundraising insights
* MongoDB aggregation pipelines for analytics

---

# Tech Stack

## Frontend

* Next.js
* React.js
* Tailwind CSS

## Backend

* Node.js
* Next.js API Routes

## Database

* MongoDB
* Mongoose

## Authentication

* NextAuth.js
* GitHub OAuth

## Payments

* Razorpay

---

# Installation

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/get-me-a-chai.git
```

## Navigate to project directory

```bash
cd get-me-a-chai
```

## Install dependencies

```bash
npm install
```

## Create environment variables

Create a `.env.local` file and add:

```env
MONGODB_URI=your_mongodb_uri
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Run the development server

```bash
npm run dev
```

---

# Future Improvements

* Email notifications
* Creator subscription system
* Enhanced analytics dashboard
* Mobile responsiveness improvements
* Admin dashboard

---

# Author

Ayush Dabhade
