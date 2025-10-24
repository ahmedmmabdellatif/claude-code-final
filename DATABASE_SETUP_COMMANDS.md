# Database Setup Commands

## Quick Setup (Run these in order)

Since your code is in the Rork sandbox environment, I'll run these commands for you. Here's what needs to be executed:

### 1. Generate Prisma Client
```bash
bunx prisma generate
```
This generates the TypeScript types and client from your schema.

### 2. Push Schema to Database
```bash
bunx prisma db push
```
This syncs your Prisma schema with the Neon PostgreSQL database without creating migration files (perfect for development).

### 3. Seed the Database
```bash
bun run prisma/seed.ts
```
This populates your database with initial data:
- Coach account: coach@example.com / password123
- Client account: client@example.com / password123
- 15 exercises (bench press, squats, deadlifts, etc.)
- 12 food items (chicken, rice, eggs, etc.)
- 3 program offers (Basic, Plus, Premium)
- Sample goals and measurements

### 4. Optional: View Your Database
```bash
bunx prisma studio
```
Opens a visual database browser at http://localhost:5555

## What's Already Configured

✅ Database URL is set in `.env`:
```
DATABASE_URL="postgresql://neondb_owner:npg_Ed2NGgaVL8yQ@ep-super-block-a8emd4gs-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
```

✅ Prisma schema is complete with all models (User, Client, Coach, Plans, Goals, Messages, etc.)

✅ Backend routes are ready to use Prisma

✅ Seed file has realistic initial data

## After Setup

Once the database is set up, you can:

1. **Login as Coach**: email: `coach@example.com`, password: `password123`
2. **Login as Client**: email: `client@example.com`, password: `password123`
3. **Start the app**: Run your normal start command
4. **Test the flow**: Registration → Payment → Onboarding → AI Plan Generation

## Test Credentials

### Coach Account
- Email: coach@example.com
- Password: password123
- Has 3 program offers created

### Client Account  
- Email: client@example.com
- Password: password123
- Already has goals, measurements, and is linked to the coach

## Troubleshooting

### If Prisma client is not found:
```bash
bunx prisma generate
```

### If schema changes are not reflected:
```bash
bunx prisma db push
bunx prisma generate
```

### To reset the database (⚠️ destroys all data):
```bash
bunx prisma db push --force-reset
bun run prisma/seed.ts
```

### To check database connection:
```bash
bunx prisma db pull
```
