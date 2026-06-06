# Development Guide

Quick reference for developers working on Get Me A Chai.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

## Project Structure at a Glance

```
app/                      # Next.js App Router
├── api/auth/...         # Authentication endpoints
├── models/              # TypeScript Mongoose schemas
├── Dashboard/           # Creator dashboard
├── [username]/          # Creator profile pages
└── db/                  # Database utilities

actions/                # Server actions
├── useractions.ts      # All data operations

lib/
├── validation.ts       # Input validation utilities

components/            # React components
├── PaymentPage.js      # Payment form
├── Navbar.jsx          # Navigation
└── ...

public/               # Static assets
```

## Common Tasks

### Adding a New Field to User

1. **Update model** (`app/models/User.ts`):
```typescript
const UserSchema = new Schema<IUser>({
  // ... existing fields
  newField: {
    type: String,
    default: null
  }
})
```

2. **Update interface** (same file):
```typescript
export interface IUser extends Document {
  // ... existing fields
  newField?: string
}
```

3. **Update form** (e.g., `app/Dashboard/page.tsx`):
```typescript
const [form, setForm] = useState({
  // ... existing fields
  newField: ''
})
```

### Creating a New Server Action

1. **Add to `actions/useractions.ts`**:
```typescript
export const myNewAction = async (
  param1: string
): Promise<ActionResponse<ResultType>> => {
  try {
    await connectDb()

    // Validation
    if (!param1) {
      return { success: false, error: "Parameter required" }
    }

    // Business logic
    const result = await MyModel.find(...)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "Operation failed" }
  }
}
```

2. **Use in component**:
```typescript
const result = await myNewAction(param)
if (result.success) {
  toast.success("Success!")
} else {
  toast.error(result.error)
}
```

### Adding Validation for a Field

1. **Add to `lib/validation.ts`**:
```typescript
export const validateFieldName = (value: string): ValidationResult => {
  if (!value || value.length < 3) {
    return { isValid: false, error: "Must be at least 3 characters" }
  }
  return { isValid: true }
}
```

2. **Use in server action**:
```typescript
const validation = validateFieldName(fieldValue)
if (!validation.isValid) {
  return { success: false, error: validation.error }
}
```

## Database Operations

### Query Patterns

```typescript
// Fetch single document
const user = await User.findOne({ email: "..." }).lean()

// Fetch multiple documents
const payments = await Payment.find({
  toUser: userId,
  status: "completed"
})
  .sort({ createdAt: -1 })
  .limit(10)
  .lean()

// Aggregate for statistics
const stats = await Payment.aggregate([
  { $match: { toUser: userId, status: "completed" } },
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" }
    }
  }
])

// Update single document
await User.findByIdAndUpdate(userId, { name: "New Name" })

// Update multiple documents
await Payment.updateMany(
  { status: "pending" },
  { status: "failed" }
)
```

### Best Practices

- ✅ Always use `.lean()` for read-only queries
- ✅ Always call `await connectDb()` first
- ✅ Use `.select()` to limit fields if not needed
- ✅ Use `.limit()` to prevent loading too much data
- ✅ Use aggregate for complex statistics
- ✅ Add indexes for frequently queried fields

## Authentication Flow

```typescript
// Check if user is authenticated
const { data: session, status } = useSession()

// After login, session contains:
session.user.email      // From GitHub
session.user.name       // From GitHub
session.user.username   // From DB or GitHub login
session.user.id         // From JWT token

// Sign out
await signOut({ callbackUrl: "/" })

// Update session
await update({ username: newUsername })
```

## Testing in Development

### Testing Razorpay Integration

1. Use Razorpay test credentials (from .env.example)
2. Test payment orders are created but not captured
3. Use test Razorpay keys for development

### Testing Payment Flow

1. Navigate to creator profile
2. Submit payment form (test credentials)
3. Razorpay modal appears
4. Use test card: 4111 1111 1111 1111
5. Check `/Dashboard` for payment record

### Testing Database

```bash
# Open MongoDB Atlas
# View collections in your database
# Check Payment and User documents
```

## Debugging

### Enable Detailed Logging

Add to server actions:
```typescript
console.log("Debug:", {
  userId,
  paymentAmount,
  timestamp: new Date()
})
```

### Check Server Action Results

```typescript
const result = await myAction()
console.log("Action result:", result)
if (!result.success) {
  console.error("Error:", result.error)
}
```

### Database Connection Issues

```typescript
// Check in connectDb.ts
const mongoose = require('mongoose')
console.log('Connection state:', mongoose.connection.readyState)
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

## Performance Tips

### Optimize Queries

```typescript
// ❌ Bad: Loads entire document
const user = await User.findById(userId)

// ✅ Good: Select only needed fields
const user = await User.findById(userId).select("username email")

// ✅ Good: Lean for read-only
const payments = await Payment.find({...}).lean()
```

### Cache Frequently Accessed Data

```typescript
// Use React hooks to cache
const [cachedUser, setCachedUser] = useState<IUser | null>(null)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  if (!cachedUser) {
    loadUser()
  }
}, [])
```

### Use Aggregation for Complex Queries

```typescript
// Better than fetching all and computing in code
const stats = await Payment.aggregate([
  { $match: { toUsername } },
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" },
      count: { $sum: 1 },
      average: { $avg: "$amount" }
    }
  }
])
```

## Deployment Checklist

- [ ] Update `.env.example` with all needed variables
- [ ] Check for console.logs in production code
- [ ] Verify all imports use TypeScript paths
- [ ] Test payment flow end-to-end
- [ ] Verify Razorpay production credentials
- [ ] Check GitHub OAuth production keys
- [ ] Test authentication flow
- [ ] Verify database indexes exist
- [ ] Check for any hardcoded URLs
- [ ] Review error messages (user-friendly)
- [ ] Test responsive design on mobile
- [ ] Verify all forms work correctly

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm start                # Start production server

# Linting
npm run lint             # Run ESLint

# Type checking
npx tsc --noEmit         # Check TypeScript errors
```

## Common Errors & Solutions

### "User not found"
- Check username is lowercase
- Verify database has user record
- Check connection to MongoDB

### "Razorpay credentials not configured"
- User needs to add credentials in Dashboard
- Verify credentials are saved in database
- Check environment has correct test keys

### "Session is null"
- Ensure user is logged in
- Check NEXTAUTH_SECRET is set
- Verify GitHub OAuth credentials

### "TypeScript errors"
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes following patterns above
3. Test thoroughly locally
4. Commit with clear message
5. Push and create Pull Request

## Resources

- [Next.js Documentation](https://nextjs.org)
- [Mongoose Documentation](https://mongoosejs.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Razorpay Documentation](https://razorpay.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

Questions? Check the main README.md or ARCHITECTURE.md
