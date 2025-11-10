# Installation Guide - OneBills with Supabase

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (installed globally or via npx)
- Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@supabase/supabase-js` - Supabase client
- `@react-native-async-storage/async-storage` - Session storage
- `react-native-url-polyfill` - URL polyfill for React Native
- `zustand` - State management

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `onebills` (or your preferred name)
   - **Database Password:** Create a strong password (save it securely!)
   - **Region:** Choose the region closest to your users
5. Wait for project initialization (~2 minutes)

## Step 3: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 4: Configure App Credentials

### Option A: Using app.json (Recommended)

Edit `app.json` and update the `extra` section:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-id.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

### Option B: Using Environment Variables

1. Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Install `expo-constants` if not already installed (it's included)

## Step 5: Run Database Migration

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Open the file `supabase/migrations/001_initial_schema.sql` from this project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **"Run"** (or press Ctrl/Cmd + Enter)
8. Wait for the migration to complete

This will create:
- All database tables
- Row Level Security policies
- Indexes for performance
- Triggers for auto-updates
- Sample bill categories

## Step 6: Verify Installation

Start your development server:

```bash
npm start
```

Or:

```bash
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app

## Step 7: Test Supabase Connection

Create a test file or add to your app to verify connection:

```typescript
import { supabase } from '@/lib/supabase/client';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('bill_categories')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Connection error:', error);
  } else {
    console.log('✅ Supabase connected!', data);
  }
};
```

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've added credentials to `app.json` or `.env`
- Restart Expo after adding credentials
- Clear cache: `npx expo start -c`

### "Not authenticated" errors
- Make sure you're signed in
- Check session: `await supabase.auth.getSession()`

### Database migration errors
- Make sure you're running the migration in the correct database
- Check that all SQL is copied correctly
- Verify you have the correct permissions

### Module not found errors
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start -c`

## Next Steps

1. ✅ Dependencies installed
2. ✅ Supabase project created
3. ✅ Credentials configured
4. ✅ Database migrated
5. 🚀 **Start building!**

See [SUPABASE_QUICKSTART.md](./SUPABASE_QUICKSTART.md) for code examples and usage.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

---

**You're ready to build! 🎉**

