# OneBills 💳

A centralized fintech app for bill payments. Pay your bills and help others pay theirs - all in one place.

## 📱 About

OneBills is a React Native (Expo) application that allows users to:
- Pay their own bills (utilities, telecom, insurance, etc.)
- Pay bills for others
- Manage all bill services in a centralized platform
- Track payment history and receipts

## 🚀 Quick Start

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Choose your platform:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

## 📚 Documentation

### Planning & Architecture
- **[MVP Plan](./MVP_PLAN.md)** - Complete MVP feature set, roadmap, and recommendations
- **[Supabase Setup](./SUPABASE_SETUP.md)** - ✅ **Supabase backend initialized!**
- **[Supabase Quick Start](./SUPABASE_QUICKSTART.md)** - Get started in 5 minutes
- **[Backend Setup Guide](./BACKEND_SETUP.md)** - Alternative: NestJS or Express setup
- **[Frontend Integration Guide](./FRONTEND_INTEGRATION.md)** - React Native API integration, state management, and examples

### Backend: Supabase ✅

**We're using Supabase for the backend:**
- ✅ **PostgreSQL database** (production-ready)
- ✅ **Built-in authentication** (email, phone, OTP)
- ✅ **Auto-generated REST API**
- ✅ **Row Level Security (RLS)**
- ✅ **Real-time subscriptions**
- ✅ **Edge Functions** for serverless logic
- ✅ **Free tier** to start, scales easily

**Quick Setup:**
1. Create project at [supabase.com](https://supabase.com)
2. Add credentials to `app.json`
3. Run database migration from `supabase/migrations/001_initial_schema.sql`
4. Start building! See [SUPABASE_QUICKSTART.md](./SUPABASE_QUICKSTART.md)

**MVP Timeline:** 6-8 weeks

**Priority Features:**
1. ✅ User Authentication
2. ✅ Bill Service Discovery
3. ✅ Add/Save Bills
4. ✅ Payment Processing
5. ✅ Transaction History

## 🏗️ Project Structure

```
onebills/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── lib/                   # Utilities, API clients, stores
├── constants/             # App constants
└── assets/               # Images, fonts, etc.
```

## 🔐 Security Considerations

This is a **fintech application**. Security is critical:

- ✅ Encrypt sensitive data at rest
- ✅ Use HTTPS/TLS for all communications
- ✅ Implement proper authentication (JWT)
- ✅ PCI DSS compliance for payment data
- ✅ KYC/AML compliance
- ✅ Rate limiting and DDoS protection

## 🛠️ Tech Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- Expo Router (File-based routing)
- React Query (Data fetching)
- Zustand (State management)

**Backend:**
- ✅ **Supabase** (PostgreSQL + Auth + API)
- Payment Gateway: Stripe/Flutterwave/Paystack

## 📋 Development Roadmap

### Phase 1: MVP (6-8 weeks)
- [ ] Backend setup & authentication
- [ ] Bill service management
- [ ] Payment processing
- [ ] Transaction history
- [ ] Frontend integration

### Phase 2: Enhancements
- [ ] Recurring payments
- [ ] Bill reminders
- [ ] Spending analytics
- [ ] Multi-currency support

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [React Query Docs](https://tanstack.com/query)

## 📝 Next Steps

1. **Set up Supabase** - Follow [SUPABASE_QUICKSTART.md](./SUPABASE_QUICKSTART.md)
2. **Install dependencies** - `npm install`
3. **Configure credentials** - Add Supabase URL and key to `app.json`
4. **Run database migration** - Copy SQL from `supabase/migrations/001_initial_schema.sql`
5. **Start building** - Authentication, bills, and transactions services are ready!
6. Review the [MVP Plan](./MVP_PLAN.md) for feature roadmap

---

**Note:** This is a financial application. Ensure proper security measures, compliance, and testing before production deployment.
"# onebills" 
