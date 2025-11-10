# Supabase Quick Start Guide - OneBills

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name:** `onebills`
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to your users
4. Wait ~2 minutes for project to initialize

### Step 2: Get Your Credentials

1. Go to **Settings > API** in your Supabase dashboard
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 3: Configure Your App

**Option A: Using app.json (Recommended)**

Edit `app.json` and add your Supabase credentials:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

**Option B: Using .env file**

1. Copy `.env.example` to `.env`
2. Add your credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### Step 5: Run Database Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click **Run**
4. Wait for migration to complete

### Step 6: Test the Connection

Start your app:

```bash
npm start
```

The Supabase client is already configured in `lib/supabase/client.ts`!

---

## 📁 What's Already Set Up

✅ **Supabase Client** (`lib/supabase/client.ts`)
- Configured with AsyncStorage for session persistence
- Ready to use throughout your app

✅ **Authentication Service** (`lib/supabase/auth.ts`)
- Sign up, sign in, sign out
- Password reset
- OTP verification
- Session management

✅ **Bills Service** (`lib/supabase/bills.ts`)
- Get categories and providers
- Manage user bills
- Full CRUD operations

✅ **Transactions Service** (`lib/supabase/transactions.ts`)
- Create and track transactions
- Get transaction history
- Transaction statistics

✅ **Auth Store** (`lib/store/auth-store.ts`)
- Zustand store for auth state
- Auto-initialization
- Auth state listeners

✅ **Database Schema** (`supabase/migrations/001_initial_schema.sql`)
- All tables created
- Row Level Security (RLS) enabled
- Indexes for performance
- Auto-update triggers

---

## 🎯 Next Steps

### 1. Initialize Auth in Your App

Update `app/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  // ... rest of your layout
}
```

### 2. Create Login Screen

```typescript
import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useAuthStore } from '@/lib/store/auth-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useAuthStore((state) => state.signIn);

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // Navigate to home
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

### 3. Use Bills Service

```typescript
import { billsService } from '@/lib/supabase/bills';
import { useEffect, useState } from 'react';

export default function BillsScreen() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await billsService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ... render categories
}
```

---

## 🔐 Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Automatic Profile Creation** - Profile created on signup
✅ **Secure Session Storage** - Sessions stored in AsyncStorage
✅ **Type Safety** - Full TypeScript support

---

## 📊 Database Tables

- `user_profiles` - Extended user information
- `bill_categories` - Bill categories (Utilities, Telecom, etc.)
- `service_providers` - Service providers (companies)
- `user_bills` - User's saved bills
- `payment_methods` - Payment methods (cards, bank accounts)
- `transactions` - Payment transactions

---

## 🧪 Testing

### Test Authentication

```typescript
import { authService } from '@/lib/supabase/auth';

// Sign up
await authService.signUp({
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
});

// Sign in
await authService.signIn({
  email: 'test@example.com',
  password: 'password123',
});
```

### Test Bills Service

```typescript
import { billsService } from '@/lib/supabase/bills';

// Get categories
const categories = await billsService.getCategories();

// Get providers
const providers = await billsService.getProviders();

// Add bill
await billsService.addBill({
  service_provider_id: 'provider-id',
  account_number: '123456',
  account_name: 'John Doe',
  is_saved: true,
});
```

---

## 🚨 Common Issues

### "Missing Supabase environment variables"
- Make sure you've added credentials to `app.json` or `.env`
- Restart Expo after adding credentials

### "Not authenticated" errors
- Make sure user is signed in
- Check if session is valid: `await authService.getSession()`

### RLS Policy errors
- Make sure you're authenticated
- Check that RLS policies are enabled in Supabase dashboard

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 💡 Tips

1. **Use Supabase Dashboard** - Great for viewing data and testing queries
2. **Enable Realtime** - Add real-time subscriptions for live updates
3. **Use Edge Functions** - For payment processing and webhooks
4. **Monitor Usage** - Check your usage in Supabase dashboard
5. **Backup Regularly** - Use Supabase backups for production

---

**You're all set! 🎉** Start building your OneBills app with Supabase!

