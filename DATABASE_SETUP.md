# 🗄️ Database Setup & Migration Guide

## Overview

Your app has been upgraded with a complete PostgreSQL database schema using Prisma ORM. All data models are defined and several routes have been migrated from mock data to real database queries.

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Install tsx (if not already installed)
```bash
bun add -d tsx
```

### Step 2: Choose Your Database Provider

#### Option A: Neon (Recommended - Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy the connection string

#### Option B: Supabase (Good for Prototyping)
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Settings → Database → Connection String (URI mode)

#### Option C: Railway (Easy Deployment)
1. Go to [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy connection string from Variables tab

#### Option D: Local PostgreSQL
```bash
# Install PostgreSQL then:
createdb fitness_coach_app
```

### Step 3: Configure Environment

Create `.env` file in root:
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

**Example URLs:**
- Neon: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`
- Supabase: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
- Railway: `postgresql://postgres:password@containers-us-west-xxx.railway.app:7472/railway`
- Local: `postgresql://localhost:5432/fitness_coach_app`

### Step 4: Generate Prisma Client & Push Schema
```bash
# Generate Prisma Client
bunx prisma generate

# Push schema to database (creates tables)
bunx prisma db push

# Verify with Prisma Studio (opens browser)
bunx prisma studio
```

### Step 5: Seed Initial Data
```bash
bunx tsx prisma/seed.ts
```

**Default accounts created:**
- **Coach:** `coach@example.com` / `password123`
- **Client:** `client@example.com` / `password123`

---

## 📊 What's Been Migrated

### ✅ Completed Migrations

1. **Authentication Routes**
   - `backend/trpc/routes/auth/login/route.ts` - Uses bcrypt for password hashing
   - `backend/trpc/routes/auth/register/route.ts` - Creates user + profile automatically

2. **CMS Exercise Routes**
   - `backend/trpc/routes/cms/exercises/route.ts` - Full CRUD with Prisma
   - All exercises now persist in database

3. **Goals Routes**
   - `backend/trpc/routes/goals/list/route.ts` - Queries from database with filtering

### 🔄 Routes Still Using Mock Data

These routes need manual migration:

- `backend/trpc/routes/cms/foods/route.ts`
- `backend/trpc/routes/coach/clients/route.ts`
- `backend/trpc/routes/coach/client-detail/route.ts`
- `backend/trpc/routes/goals/create/route.ts`
- `backend/trpc/routes/goals/update/route.ts`
- `backend/trpc/routes/goals/complete/route.ts`
- `backend/trpc/routes/goals/delete/route.ts`
- `backend/trpc/routes/measurements/add/route.ts`
- `backend/trpc/routes/measurements/list/route.ts`
- `backend/trpc/routes/messages/list/route.ts`
- `backend/trpc/routes/messages/send/route.ts`
- `backend/trpc/routes/notifications/list/route.ts`
- `backend/trpc/routes/payments/offers/route.ts`
- `backend/trpc/routes/plans/today/route.ts`
- `backend/trpc/routes/questionnaires/*` (all 4 routes)
- And more...

---

## 📁 Database Schema Highlights

### Key Models

```prisma
- User (id, email, password, name, role)
  ├── CoachProfile
  └── ClientProfile (membershipNumber, adherence, planStatus)
      ├── OnboardingData (age, weight, goals, injuries)
      ├── Plans (workout/meal plans with versions)
      ├── Tasks (daily workouts/meals)
      ├── Goals (weight, performance, habits)
      ├── Measurements (weight, chest, arms, etc.)
      ├── ProgressPhotos
      └── QuestionnaireResponses

- Exercise (name, muscleGroup, difficulty, videoUrl)
- Food (name, calories, protein, carbs, fat)
- Message (chatId, sender, message, attachments)
- Alert (type, severity, title, message)
- ProgramOffer (name, price, duration, features)
- Subscription (client, offer, status, stripeIds)
- Payment (amount, status, stripePaymentIntentId)
```

---

## 🔨 How to Migrate a Route

### Before (Mock Data):
```typescript
export const listFoodsProcedure = publicProcedure.query(async () => {
  const mockFoods = [{ id: 1, name: 'Chicken', calories: 165 }];
  return { foods: mockFoods };
});
```

### After (Prisma):
```typescript
import prisma from '../../../../db';

export const listFoodsProcedure = publicProcedure.query(async () => {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { foods };
  } catch (error) {
    console.error('[Foods] Error:', error);
    throw new Error('Failed to fetch foods');
  }
});
```

**Key Changes:**
1. Import `prisma` from `../../../../db`
2. Replace mock array with `prisma.model.findMany()`
3. Add try/catch with error logging
4. Convert IDs from `number` to `string` (Prisma uses cuid)

---

## 🧪 Testing Database Connection

### Test 1: Check Connection
```typescript
// Run in node/bun REPL
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.$connect();
console.log('✅ Connected to database!');
```

### Test 2: Query Data
```bash
bunx prisma studio
# Opens browser to view all tables and data
```

### Test 3: Test Auth
```bash
# Use your app's login screen with:
# Email: coach@example.com
# Password: password123
```

---

## 🐛 Common Issues & Fixes

### Issue: "Can't reach database server"
**Fix:** Check `DATABASE_URL` format and network access
```bash
# Test connection string
bunx prisma db pull
```

### Issue: "@prisma/client has no exported member"
**Fix:** Generate Prisma Client
```bash
bunx prisma generate
```

### Issue: "Table does not exist"
**Fix:** Push schema to database
```bash
bunx prisma db push
```

### Issue: Seed script fails
**Fix:** Check database is accessible and empty
```bash
bunx prisma db push --force-reset
bunx tsx prisma/seed.ts
```

### Issue: Lint warning about default import
**Fix:** This is just a warning, app will work fine. Or change:
```typescript
import prisma from '../../../../db';  // warning
import { prisma } from '../../../../db';  // no warning (requires export change)
```

---

## 📈 Performance Tips

### 1. Use Indexes (Already Added)
```prisma
@@index([clientId])
@@index([status])
@@index([createdAt])
```

### 2. Select Only Needed Fields
```typescript
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});
```

### 3. Use Pagination
```typescript
const goals = await prisma.goal.findMany({
  take: 20,
  skip: page * 20,
});
```

### 4. Connection Pooling (Production)
Add to `DATABASE_URL`:
```
?connection_limit=10&pool_timeout=20
```

---

## 🚀 Deployment Checklist

- [ ] Set `DATABASE_URL` in production environment
- [ ] Run `bunx prisma generate` in build step
- [ ] Run `bunx prisma migrate deploy` (or `db push`)
- [ ] Enable SSL: Add `?sslmode=require` to `DATABASE_URL`
- [ ] Set up database backups
- [ ] Monitor connection pool usage
- [ ] Add error tracking (Sentry)

---

## 📝 Next Steps

1. **Complete Route Migrations**: Update remaining 20+ routes to use Prisma
2. **Test All Features**: Ensure no breaking changes
3. **Add Migration Scripts**: For production deployments
4. **Optimize Queries**: Add caching where needed
5. **Set Up Monitoring**: Track query performance

---

## 📚 Useful Prisma Commands

```bash
# View database in browser
bunx prisma studio

# Generate Prisma Client
bunx prisma generate

# Push schema changes (dev)
bunx prisma db push

# Create migration (recommended for production)
bunx prisma migrate dev --name migration_name

# Apply migrations in production
bunx prisma migrate deploy

# Reset database (⚠️ deletes all data)
bunx prisma migrate reset

# Pull schema from existing database
bunx prisma db pull

# Format schema file
bunx prisma format

# Validate schema
bunx prisma validate
```

---

## 🎉 Success Criteria

You'll know setup is complete when:

✅ `bunx prisma studio` opens and shows all tables  
✅ You can log in with seeded credentials  
✅ Exercises/Goals/Messages persist after server restart  
✅ No mock data is returned from migrated routes  
✅ All CRUD operations work in the app  

---

**Questions?** Check Prisma docs: [prisma.io/docs](https://www.prisma.io/docs)

**Need help?** Post in #development or contact support.
