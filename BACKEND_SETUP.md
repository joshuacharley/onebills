# Backend Setup Guide - OneBills

## Quick Start with NestJS (Recommended)

### Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Redis installed (optional but recommended)
- npm or yarn

### Step 1: Initialize NestJS Project

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create new project
nest new onebills-backend

# Choose package manager (npm/yarn/pnpm)
cd onebills-backend
```

### Step 2: Install Required Dependencies

```bash
# Core dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/typeorm
npm install @nestjs/swagger @nestjs/throttler
npm install passport passport-jwt passport-local
npm install bcrypt class-validator class-transformer
npm install typeorm pg
npm install redis ioredis
npm install axios

# Payment gateway (choose one)
npm install stripe  # or @paystack/paystack-sdk or flutterwave-node-v3

# Development dependencies
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
npm install -D @types/node
```

### Step 3: Project Structure

```
onebills-backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── bills/
│   │   ├── bills.controller.ts
│   │   ├── bills.service.ts
│   │   ├── bills.module.ts
│   │   ├── entities/
│   │   │   ├── bill-category.entity.ts
│   │   │   ├── service-provider.entity.ts
│   │   │   └── user-bill.entity.ts
│   │   └── dto/
│   │       ├── create-bill.dto.ts
│   │       └── pay-bill.dto.ts
│   ├── transactions/
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.module.ts
│   │   └── entities/
│   │       └── transaction.entity.ts
│   ├── payments/
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.module.ts
│   │   └── gateways/
│   │       ├── stripe.service.ts
│   │       └── payment-gateway.interface.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   │   └── database.config.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

### Step 4: Environment Configuration

Create `.env` file:

```env
# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=onebills_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Payment Gateway (Stripe example)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS
CORS_ORIGIN=http://localhost:8081,http://localhost:19006

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Step 5: Database Configuration

Create `src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const getDatabaseConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get("DATABASE_HOST"),
  port: configService.get("DATABASE_PORT"),
  username: configService.get("DATABASE_USER"),
  password: configService.get("DATABASE_PASSWORD"),
  database: configService.get("DATABASE_NAME"),
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: configService.get("NODE_ENV") === "development",
  logging: configService.get("NODE_ENV") === "development",
  ssl:
    configService.get("NODE_ENV") === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
```

### Step 6: Main App Module Setup

Update `src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";
import { getDatabaseConfig } from "./config/database.config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BillsModule } from "./bills/bills.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { PaymentsModule } from "./payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    BillsModule,
    TransactionsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
```

### Step 7: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE onebills_db;

# Exit
\q
```

### Step 8: Run Migrations (if using TypeORM migrations)

```bash
# Generate migration
npm run typeorm migration:generate -- -n InitialSchema

# Run migrations
npm run typeorm migration:run
```

### Step 9: Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## Alternative: Express.js Setup

If you prefer Express.js for faster MVP:

### Initialize Express Project

```bash
mkdir onebills-backend
cd onebills-backend
npm init -y
npm install express typescript ts-node nodemon
npm install @types/express @types/node
npm install prisma @prisma/client
npm install jsonwebtoken bcrypt
npm install express-validator
npm install cors helmet
npm install dotenv
```

### Basic Express Server (`src/server.ts`)

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## API Endpoints Structure

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/verify-otp
```

### Bills

```
GET    /api/bills/categories
GET    /api/bills/providers
GET    /api/bills/my-bills
POST   /api/bills/add
GET    /api/bills/:id
PUT    /api/bills/:id
DELETE /api/bills/:id
```

### Payments

```
POST   /api/payments/initiate
POST   /api/payments/verify
GET    /api/payments/methods
POST   /api/payments/methods
DELETE /api/payments/methods/:id
```

### Transactions

```
GET    /api/transactions
GET    /api/transactions/:id
GET    /api/transactions/receipt/:id
```

---

## Testing the Backend

### Install Testing Dependencies

```bash
npm install -D @nestjs/testing jest @types/jest
```

### Run Tests

```bash
npm run test
npm run test:e2e
```

---

## Deployment Options

### 1. **Heroku** (Easiest for MVP)

- Free tier available
- Easy PostgreSQL addon
- Simple deployment

### 2. **Railway** (Recommended)

- Great for startups
- Automatic deployments
- Built-in PostgreSQL

### 3. **AWS/DigitalOcean** (Production)

- More control
- Better for scaling
- Requires more setup

### 4. **Vercel/Netlify** (Serverless)

- Good for API routes
- Auto-scaling
- Pay-per-use

---

## Next Steps

1. Set up the backend project structure
2. Implement authentication module
3. Create database entities
4. Set up payment gateway integration
5. Connect frontend to backend
6. Test end-to-end payment flow

---

## Useful Commands

```bash
# NestJS
npm run start:dev        # Development
npm run build            # Build
npm run start:prod       # Production
npm run test             # Unit tests
npm run test:e2e         # E2E tests

# Database
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
npm run typeorm migration:revert
```

---

## Support & Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
