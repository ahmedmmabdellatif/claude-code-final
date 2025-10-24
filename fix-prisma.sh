#!/bin/bash

echo "🔧 Fixing Prisma setup..."
echo ""

echo "📦 Step 1: Generating Prisma Client..."
bunx prisma generate

echo ""
echo "🗄️  Step 2: Pushing schema to database..."
bunx prisma db push --accept-data-loss

echo ""
echo "🌱 Step 3: Seeding database..."
bun prisma/seed.ts

echo ""
echo "✅ Prisma setup complete! Running check..."
echo ""
bun check-setup.ts
