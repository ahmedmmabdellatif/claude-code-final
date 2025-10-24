# Fix tRPC "JSON Parse error" Issue

## Problem
You're getting: `TRPCClientError: JSON Parse error: Unexpected character: <`

This happens because **Prisma Client hasn't been generated** yet, causing the backend to crash and return HTML error pages instead of JSON.

## Solution

Run these commands in order:

### Step 1: Generate Prisma Client
```bash
bunx prisma generate
```

This creates the Prisma Client based on your schema.prisma file.

### Step 2: Push Schema to Database
```bash
bunx prisma db push --accept-data-loss
```

This creates all the tables in your Neon PostgreSQL database.

### Step 3: Seed the Database
```bash
bun prisma/seed.ts
```

This populates your database with:
- Demo coach account (coach@example.com / password123)
- Demo client account (client@example.com / password123)
- 15 exercises for the CMS library
- 12 foods for meal planning
- Sample goals and measurements

## Verify the Setup

After running the commands, verify everything works:

```bash
bunx prisma studio
```

This opens a GUI where you can browse your database tables.

## Quick Setup Script

Or run this all-in-one script:

```bash
bash setup-prisma.sh
```

## What This Fixes

Once Prisma Client is generated and the database is set up:
- ✅ tRPC endpoints will return JSON (not HTML errors)
- ✅ Backend can query the database
- ✅ All CRUD operations will work
- ✅ You'll have seed data to test with

## Next Steps

After setup completes:
1. Restart your development server
2. The heartbeat error should be gone
3. You can start using real data instead of mocks
