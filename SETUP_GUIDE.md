# 🚀 AI Fitness Coach App - Complete Setup Guide

## 📋 Overview

This is a fully functional AI-powered fitness coaching platform with **real database integration**, **automated workflows**, and **intelligent tracking systems**.

**Key Features:**
- ✅ Real PostgreSQL database with Prisma ORM
- ✅ Complete user authentication and authorization
- ✅ AI-powered plan generation using label extraction
- ✅ Real-time adherence tracking and alerting
- ✅ Automated 30-day questionnaire triggers
- ✅ Task management with completion tracking
- ✅ Coach dashboard with live client metrics
- ✅ CMS for exercises and foods
- ✅ Goal tracking and progress monitoring

---

## 🔧 Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **PostgreSQL** database (local or cloud: Neon, Supabase, etc.)
- **Expo Go** app on your phone (for mobile testing)
- Optional: **Cloudinary** or **AWS S3** for media uploads
- Optional: **Stripe** account for payments (test mode)

---

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
bun install
# or
npm install
```

### 2. Setup Database

#### Option A: Use Neon (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

#### Option B: Use Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the connection string from Settings > Database

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL locally
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb fitness_coach_app
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database - REQUIRED
DATABASE_URL="postgresql://user:password@host:5432/fitness_coach_app"

# Backend API - Will be auto-configured by Rork
EXPO_PUBLIC_API_URL="http://localhost:3000"

# JWT - Generate a random string
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Optional: Cloud Storage (choose one)
# AWS S3
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET="your_bucket_name"
AWS_S3_REGION="us-east-1"

# Or Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Optional: Stripe (for payments)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# App Environment
NODE_ENV="development"
```

### 4. Setup Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

This will create:
- ✅ 1 Coach account (email: `coach@example.com`, password: `password123`)
- ✅ 1 Client account (email: `client@example.com`, password: `password123`)
- ✅ 15 Exercises (various difficulty levels and muscle groups)
- ✅ 12 Foods (with complete macro data)
- ✅ 3 Program offers (Basic, Plus, Premium)
- ✅ Sample goals and measurements

---

## 🎯 Running the App

### Development Mode

```bash
# Start the development server
bun start
# or
npm start
```

This will:
1. Start the backend server with hot reload
2. Launch Expo Dev Tools
3. Show a QR code to open on your phone

### Testing on Mobile

1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code displayed in terminal
3. App will load on your phone

### Testing on Web

```bash
bun start -- --web
```

Then open `http://localhost:8081` in your browser.

---

##🔑 Default Accounts

### Coach Account
- **Email:** `coach@example.com`
- **Password:** `password123`
- **Access:** Coach dashboard, CMS management, AI plan generation

### Client Account
- **Email:** `client@example.com`
- **Password:** `password123`
- **Access:** Client dashboard, task tracking, progress monitoring

---

## 🧪 Testing the Full Workflow

### 1. Test Client Onboarding → AI Plan Generation

```bash
# 1. Register a new client (or use client@example.com)
# 2. Complete onboarding questionnaire
# 3. System will:
#    - Extract labels from onboarding data
#    - Notify coach
#    - Mark client as "pending plan"
```

### 2. Test AI Plan Generation

```bash
# As coach (coach@example.com):
# 1. Go to Clients tab
# 2. Select a client
# 3. Click "Generate AI Plan"
# 4. Review AI-suggested plan
# 5. Customize if needed
# 6. Assign plan to client

# Behind the scenes:
# - AI reads client labels
# - Filters exercises based on injuries
# - Filters foods based on diet restrictions
# - Creates workout + meal plan
# - Generates daily tasks for the plan duration
```

### 3. Test Task Completion → Adherence Tracking

```bash
# As client:
# 1. Go to Dashboard
# 2. Complete a workout task
# 3. System will:
#    - Update task status
#    - Recalculate adherence %
#    - Update lastCheckin timestamp
```

### 4. Test Alert Generation

```bash
# Manually trigger alert check:
curl -X POST http://localhost:3000/api/trpc/alerts.generate \
  -H "Content-Type: application/json" \
  -d '{"coachId":"<coach-user-id>"}'

# System checks for:
# - Low adherence (<60%)
# - Very low adherence (<40%)
# - Missed check-ins (>3 days)
# - Progress plateaus (weight unchanged 2+ weeks)
```

### 5. Test 30-Day Questionnaire Trigger

```bash
# Manually trigger questionnaire check:
curl -X POST http://localhost:3000/api/trpc/cron.checkQuestionnaires

# System will:
# - Find clients active for 30+ days
# - Check if last monthly questionnaire was >30 days ago
# - Send notification to client
# - Client completes questionnaire
# - Responses stored and compared with original
```

---

## 📊 Database Management

### View Database

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

This opens `http://localhost:5555` where you can:
- View all tables
- Edit records
- Run queries
- Inspect relationships

### Reset Database

```bash
# WARNING: This deletes all data
npx prisma migrate reset

# Then reseed
npx prisma db seed
```

### Add Migration

```bash
# After changing schema.prisma
npx prisma migrate dev --name your_migration_name
```

---

## 🔄 Data Flow Architecture

### Client Registration → Plan Assignment

```
1. User registers → Creates User + ClientProfile
2. Onboarding submission → Creates OnboardingData
3. Label extraction → Creates ClientLabels
4. Coach generates plan → AI uses Labels + CMS data
5. Plan assignment → Creates Plan + Tasks
6. Tasks appear on client dashboard
```

### Task Completion → Alert Generation

```
1. Client completes task → Updates Task.status
2. System recalculates adherence → Updates ClientProfile.adherence
3. Adherence drops below threshold → System creates Alert
4. Alert appears on coach dashboard
5. Coach takes action → Resolves Alert
```

### 30-Day Flow

```
1. Client active for 30 days → Cron checks dates
2. System sends notification → Client sees prompt
3. Client fills questionnaire → Stores responses
4. Coach compares responses → Views progress/changes
5. Coach updates plan → Creates new version
```

---

## 🛠 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db push

# If fails, check:
# 1. DATABASE_URL in .env is correct
# 2. Database server is running
# 3. Firewall allows connection
# 4. SSL mode is correct (add ?sslmode=require for cloud DBs)
```

### Migration Errors

```bash
# If migration fails
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

### Type Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📁 Project Structure

```
/
├── app/                    # Expo Router pages
│   ├── client/            # Client-facing screens
│   ├── coach/             # Coach-facing screens
│   └── (auth)/            # Authentication flows
├── backend/
│   ├── trpc/              # tRPC API routes
│   │   └── routes/        # Organized by feature
│   ├── services/          # Business logic
│   │   ├── aiPlanGenerator.ts
│   │   ├── labelExtractor.ts
│   │   └── questionnaireScheduler.ts
│   ├── db.ts              # Prisma client
│   └── hono.ts            # Server entry
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── components/            # Reusable UI components
├── contexts/              # React Context providers
└── utils/                 # Helper functions
```

---

## 🚀 Next Steps

1. **Setup cloud database** (Neon/Supabase) for persistence
2. **Configure media storage** (Cloudinary/S3) for photos/videos
3. **Add Stripe** for real payment processing
4. **Setup cron jobs** for automated questionnaire triggers
5. **Deploy backend** to production (Railway, Fly.io, etc.)
6. **Build mobile app** with `eas build`

---

## 📚 API Documentation

All tRPC endpoints are available at:

```
http://localhost:3000/api/trpc/*
```

### Key Endpoints

#### Authentication
- `auth.register` - Register new user
- `auth.login` - Login existing user

#### Onboarding
- `onboarding.submit` - Submit onboarding form
- `onboarding.get` - Get onboarding data

#### Labels
- `labels.extract` - Extract labels from onboarding
- `labels.get` - Get client labels
- `labels.update` - Update specific label

#### Plans
- `plans.today` - Get today's tasks
- `coach.aiSuggestions` - Generate AI plan
- `coach.assignPlan` - Assign plan to client

#### Tasks & Tracking
- `workouts.complete` - Mark task complete
- `measurements.add` - Add body measurements
- `tracking.stats` - Get tracking statistics

#### Alerts
- `alerts.generate` - Generate alerts for clients
- `alerts.list` - List all alerts
- `alerts.resolve` - Resolve an alert

#### CMS
- `cms.listExercises` - Get all exercises
- `cms.createExercise` - Add new exercise
- `cms.listFoods` - Get all foods
- `cms.createFood` - Add new food

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Prisma logs: `npx prisma studio`
3. Check backend logs in terminal
4. Inspect browser/Expo console for errors

---

## 📝 License

MIT License - Feel free to use this for your own projects!
